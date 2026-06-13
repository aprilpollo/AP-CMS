package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"

	"apcms/internal/adapters/config"
	"apcms/internal/adapters/storage/orm"
	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/adapters/storage/orm/views"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/jedib0t/go-pretty/v6/text"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// ── Seed file schema ───────────────────────────────────────────────────────

type lookupItem struct {
	Code  string `json:"code"`
	Label string `json:"label"`
}

type roleItem struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type permItem struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type settingItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Type  string `json:"type"`
	Group string `json:"group"`
}

type userItem struct {
	Email       string `json:"email"`
	AvatarURL  *string `json:"avatar_url,omitempty"`
	DisplayName string `json:"display_name"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Bio         *string `json:"bio,omitempty"`
	Role        string `json:"role"`
	Password    string `json:"password"`
}

type seedData struct {
	Lookups         map[string][]lookupItem `json:"lookups"`
	Roles           []roleItem              `json:"roles"`
	Permissions     []permItem              `json:"permissions"`
	RolePermissions map[string][]string     `json:"role_permissions"`
	Settings        []settingItem           `json:"settings"`
	Users           []userItem              `json:"users"`
}

// lookupTables fixes the seed order and acts as an allow-list for raw SQL.
var lookupTables = []string{
	"post_statuses", "post_types", "content_formats",
	"comment_statuses", "setting_types", "audit_actions",
}

func loadSeed(path string) (*seedData, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var s seedData
	if err := json.Unmarshal(raw, &s); err != nil {
		return nil, err
	}
	return &s, nil
}

func main() {
	seedPath := "seed.json"
	if len(os.Args) > 1 {
		seedPath = os.Args[1]
	}
	seed, err := loadSeed(seedPath)
	if err != nil {
		log.Fatalf("load seed %q: %v", seedPath, err)
	}

	cfg, err := config.GetConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := orm.NewGormDB(cfg.Database, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	}, true)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	mTable := newTable()
	successCount := 0
	failCount := 0

	// ── Migration ────────────────────────────────────────────────────────────
	section(mTable, "TABLES", "MIGRATION TABLES")
	for _, model := range models.All() {
		err := db.Migrate(model)
		if err != nil {
			mTable.AppendRow(table.Row{model.TableName(), text.Colors{text.FgRed}.Sprint("✗ Failed"), parseErrorMessage(err)})
			failCount++
		} else {
			mTable.AppendRow(table.Row{model.TableName(), text.Colors{text.FgGreen}.Sprint("✓ Migrated"), "SUCCESS"})
			successCount++
		}
	}

	// ── Migration: Views ──────────────────────────────────────────────────────
	// Views depend on the tables above, so they are (re)created afterwards.
	section(mTable, "VIEWS", "MIGRATION VIEWS")
	for viewName, viewSQL := range views.Views {
		db.GetDB().Exec(fmt.Sprintf("DROP VIEW IF EXISTS %q", viewName))
		if err := db.GetDB().Exec(viewSQL).Error; err != nil {
			mTable.AppendRow(table.Row{viewName, text.Colors{text.FgRed}.Sprint("✗ Failed"), parseErrorMessage(err)})
			failCount++
		} else {
			mTable.AppendRow(table.Row{viewName, text.Colors{text.FgGreen}.Sprint("✓ Migrated"), "SUCCESS"})
			successCount++
		}
	}

	// ── Seed: Lookups ─────────────────────────────────────────────────────────
	section(mTable, "LOOKUPS", "SEED DATA")
	for _, tbl := range lookupTables {
		for _, it := range seed.Lookups[tbl] {
			res := db.GetDB().Exec(
				"INSERT INTO "+tbl+" (code, label) VALUES (?, ?) ON CONFLICT (code) DO NOTHING",
				it.Code, it.Label,
			)
			appendUpsertRow(mTable, tbl+":"+it.Code, res, &failCount, &successCount)
		}
	}

	// ── Seed: Roles & Permissions ─────────────────────────────────────────────
	section(mTable, "ROLES & PERMISSIONS", "SEED DATA")

	roleID := map[string]int64{}
	for _, r := range seed.Roles {
		m := models.RoleModel{Name: r.Name, Slug: r.Slug}
		err := db.GetDB().Where("slug = ?", r.Slug).FirstOrCreate(&m).Error
		appendResultRow(mTable, "role:"+r.Slug, err, &failCount, &successCount)
		roleID[r.Slug] = m.ID
	}

	permID := map[string]int64{}
	for _, p := range seed.Permissions {
		m := models.PermissionModel{Name: p.Name, Slug: p.Slug}
		err := db.GetDB().Where("slug = ?", p.Slug).FirstOrCreate(&m).Error
		appendResultRow(mTable, "perm:"+p.Slug, err, &failCount, &successCount)
		permID[p.Slug] = m.ID
	}

	for _, r := range seed.Roles {
		for _, p := range seed.RolePermissions[r.Slug] {
			rid, pid := roleID[r.Slug], permID[p]
			if rid == 0 || pid == 0 {
				mTable.AppendRow(table.Row{r.Slug + " → " + p, text.Colors{text.FgRed}.Sprint("✗ Failed"), "unknown role/permission"})
				failCount++
				continue
			}
			row := models.RolePermissionModel{RoleID: rid, PermissionID: pid}
			err := db.GetDB().Where("role_id = ? AND permission_id = ?", rid, pid).FirstOrCreate(&row).Error
			appendResultRow(mTable, r.Slug+" → "+p, err, &failCount, &successCount)
		}
	}

	// ── Seed: Settings ────────────────────────────────────────────────────────
	section(mTable, "SETTINGS", "SEED DATA")

	settingTypeID := map[string]int64{}
	var stRows []models.SettingTypeModel
	_ = db.GetDB().Find(&stRows).Error
	for _, st := range stRows {
		settingTypeID[st.Code] = st.ID
	}
	for _, s := range seed.Settings {
		val := s.Value
		row := models.SettingModel{Key: s.Key, Value: &val, ValueTypeID: settingTypeID[s.Type], Group: s.Group}
		err := db.GetDB().Where("key = ?", s.Key).FirstOrCreate(&row).Error
		appendResultRow(mTable, "setting:"+s.Key, err, &failCount, &successCount)
	}

	// ── Seed: Users ──────────────────────────────────────────────────────────
	section(mTable, "USERS", "SEED DATA")
	for _, u := range seed.Users {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			appendResultRow(mTable, u.Email, err, &failCount, &successCount)
			continue
		}
		
		var rid int64
		if id, ok := roleID[u.Role]; ok {
			rid = id
		}
		m := models.UserModel{
			Email:        u.Email,
			PasswordHash: string(hash),
			DisplayName:  u.DisplayName,
			FirstName:    u.FirstName,
			LastName:     u.LastName,
			Bio:          u.Bio,
			AvatarURL:    u.AvatarURL,
			IsActive:     true,
			RoleID:       rid,
		}
		err = db.GetDB().Where("email = ?", u.Email).FirstOrCreate(&m).Error
		appendResultRow(mTable, u.Email, err, &failCount, &successCount)
	}

	mTable.AppendFooter(table.Row{"Summary", "", "Success: " + strconv.Itoa(successCount) + " Failed: " + strconv.Itoa(failCount)})
	mTable.Render()
}

// ── Output helpers ─────────────────────────────────────────────────────────

func newTable() table.Writer {
	mTable := table.NewWriter()
	mTable.SetOutputMirror(os.Stdout)
	mTable.SetStyle(table.StyleRounded)
	mTable.Style().Title.Align = text.AlignCenter
	mTable.Style().Options.DoNotColorBordersAndSeparators = true
	mTable.Style().Options.DrawBorder = false
	mTable.Style().Options.SeparateColumns = true
	mTable.Style().Options.SeparateFooter = true
	mTable.Style().Options.SeparateHeader = true
	mTable.Style().Options.SeparateRows = false
	mTable.AppendHeader(table.Row{"NAME", "STATUS", "MESSAGE"})
	mTable.SetColumnConfigs([]table.ColumnConfig{
		{Number: 1, WidthMin: 20, AlignHeader: text.AlignLeft},
		{Number: 2, WidthMin: 20, AlignHeader: text.AlignLeft},
		{Number: 3, WidthMin: 20, AlignHeader: text.AlignLeft},
	})
	return mTable
}

func section(mTable table.Writer, name, message string) {
	mTable.AppendRow(table.Row{"", "", ""})
	mTable.AppendRow(table.Row{name, "", message})
	mTable.AppendRow(table.Row{"-", "-", "-"})
}

func parseErrorMessage(err error) string {
	errorStr := err.Error()
	re := regexp.MustCompile(`\(SQLSTATE ([A-Z0-9]+)\)`)
	if matches := re.FindStringSubmatch(errorStr); len(matches) == 2 {
		return "SQLSTATE " + matches[1]
	}
	if len(errorStr) > 100 {
		return errorStr[:100] + "..."
	}
	return errorStr
}

func isDuplicateError(err error) bool {
	return parseErrorMessage(err) == "SQLSTATE 23505"
}

func appendResultRow(mTable table.Writer, name string, err error, failCount, successCount *int) {
	if err != nil {
		if isDuplicateError(err) {
			mTable.AppendRow(table.Row{name, text.Colors{text.FgYellow}.Sprint("✓ Skipped"), parseErrorMessage(err)})
			*successCount++
		} else {
			mTable.AppendRow(table.Row{name, text.Colors{text.FgRed}.Sprint("✗ Failed"), parseErrorMessage(err)})
			*failCount++
		}
		return
	}
	mTable.AppendRow(table.Row{name, text.Colors{text.FgGreen}.Sprint("✓ Created"), "SUCCESS"})
	*successCount++
}

func appendUpsertRow(mTable table.Writer, name string, res *gorm.DB, failCount, successCount *int) {
	if res.Error != nil {
		mTable.AppendRow(table.Row{name, text.Colors{text.FgRed}.Sprint("✗ Failed"), parseErrorMessage(res.Error)})
		*failCount++
		return
	}
	if res.RowsAffected == 0 {
		mTable.AppendRow(table.Row{name, text.Colors{text.FgYellow}.Sprint("✓ Skipped"), "EXISTS"})
	} else {
		mTable.AppendRow(table.Row{name, text.Colors{text.FgGreen}.Sprint("✓ Created"), "SUCCESS"})
	}
	*successCount++
}
