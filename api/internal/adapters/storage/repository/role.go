package repository

import (
	"context"
	"errors"

	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/adapters/storage/orm/views"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"

	"gorm.io/gorm"
)

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) output.RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Role, int64, error) {
	var rows []models.RoleModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.RoleModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.RoleModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	roles := make([]domain.Role, len(rows))
	ids := make([]int64, len(rows))
	at := make(map[int64]int, len(rows))
	for i, row := range rows {
		roles[i] = *toDomainRole(row)
		ids[i] = row.ID
		at[row.ID] = i
	}
	if len(ids) == 0 {
		return roles, total, nil
	}

	perms, err := r.permissionsByRoleIDs(ctx, ids)
	if err != nil {
		return nil, 0, err
	}
	for roleID, list := range perms {
		if i, ok := at[roleID]; ok {
			roles[i].Permissions = list
		}
	}

	counts, err := r.userCountsByRoleIDs(ctx, ids)
	if err != nil {
		return nil, 0, err
	}
	for roleID, n := range counts {
		if i, ok := at[roleID]; ok {
			roles[i].UserCount = n
		}
	}

	return roles, total, nil
}

func (r *roleRepository) FindByID(ctx context.Context, id int64) (*domain.Role, error) {
	var row models.RoleModel
	if err := r.db.WithContext(ctx).First(&row, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrRoleNotFound
		}
		return nil, err
	}

	role := toDomainRole(row)

	perms, err := r.permissionsByRoleIDs(ctx, []int64{id})
	if err != nil {
		return nil, err
	}
	role.Permissions = perms[id]

	count, err := r.CountUsers(ctx, id)
	if err != nil {
		return nil, err
	}
	role.UserCount = count

	return role, nil
}

func (r *roleRepository) FindAllPermissions(ctx context.Context, opts query.QueryOptions) ([]domain.Permission, int64, error) {
	var rows []models.PermissionModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.PermissionModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.PermissionModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	permissions := make([]domain.Permission, len(rows))
	for i, row := range rows {
		permissions[i] = domain.Permission{ID: row.ID, Name: row.Name, Slug: row.Slug}
	}

	return permissions, total, nil
}

func (r *roleRepository) PermissionIDsExist(ctx context.Context, ids []int64) (bool, error) {
	if len(ids) == 0 {
		return true, nil
	}
	var found int64
	if err := r.db.WithContext(ctx).
		Model(&models.PermissionModel{}).
		Where("id IN ?", ids).
		Distinct("id").
		Count(&found).Error; err != nil {
		return false, err
	}
	return found == int64(len(ids)), nil
}

func (r *roleRepository) SlugExists(ctx context.Context, slug string, excludeID int64) (bool, error) {
	scope := r.db.WithContext(ctx).Model(&models.RoleModel{}).Where("slug = ?", slug)
	if excludeID > 0 {
		scope = scope.Where("id <> ?", excludeID)
	}
	var count int64
	if err := scope.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *roleRepository) Create(ctx context.Context, in *domain.CreateRoleInput) (*domain.Role, error) {
	row := &models.RoleModel{Name: in.Name}
	if in.Slug != nil {
		row.Slug = *in.Slug
	}
	if in.Color != nil && *in.Color != "" {
		row.Color = *in.Color
	}

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(row).Error; err != nil {
			return err
		}
		return replacePermissions(tx, row.ID, in.PermissionIDs)
	})
	if err != nil {
		return nil, err
	}

	return r.FindByID(ctx, row.ID)
}

func (r *roleRepository) Update(ctx context.Context, id int64, in *domain.UpdateRoleInput) (*domain.Role, error) {
	fields := map[string]any{}
	if in.Name != nil {
		fields["name"] = *in.Name
	}
	if in.Slug != nil {
		fields["slug"] = *in.Slug
	}
	if in.Color != nil {
		fields["color"] = *in.Color
	}

	if len(fields) > 0 {
		res := r.db.WithContext(ctx).Model(&models.RoleModel{}).Where("id = ?", id).Updates(fields)
		if res.Error != nil {
			return nil, res.Error
		}
	}

	return r.FindByID(ctx, id)
}

func (r *roleRepository) SetPermissions(ctx context.Context, id int64, permissionIDs []int64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return replacePermissions(tx, id, permissionIDs)
	})
}

func (r *roleRepository) Delete(ctx context.Context, id int64) error {
	res := r.db.WithContext(ctx).Delete(&models.RoleModel{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return domain.ErrRoleNotFound
	}
	return nil
}

func (r *roleRepository) CountUsers(ctx context.Context, id int64) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.UserModel{}).Where("role_id = ?", id).Count(&count).Error
	return count, err
}

/* ---------- helpers ---------- */

func toDomainRole(row models.RoleModel) *domain.Role {
	createdAt := row.CreatedAt
	return &domain.Role{
		ID:        row.ID,
		Name:      row.Name,
		Slug:      row.Slug,
		Color:     row.Color,
		CreatedAt: &createdAt,
	}
}

// permissionsByRoleIDs reads the flattened vw_role_permission view once for the
// whole page of roles, instead of a query per role.
func (r *roleRepository) permissionsByRoleIDs(ctx context.Context, ids []int64) (map[int64][]domain.Permission, error) {
	var rows []views.VWRolePermission
	if err := r.db.WithContext(ctx).
		Model(&views.VWRolePermission{}).
		Where("role_id IN ?", ids).
		Order("slug ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}

	out := make(map[int64][]domain.Permission, len(ids))
	for _, row := range rows {
		out[row.RoleID] = append(out[row.RoleID], domain.Permission{ID: row.ID, Name: row.Name, Slug: row.Slug})
	}
	return out, nil
}

func (r *roleRepository) userCountsByRoleIDs(ctx context.Context, ids []int64) (map[int64]int64, error) {
	type roleCount struct {
		RoleID int64
		Total  int64
	}
	var rows []roleCount
	if err := r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Select("role_id, COUNT(*) AS total").
		Where("role_id IN ?", ids).
		Group("role_id").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	out := make(map[int64]int64, len(rows))
	for _, row := range rows {
		out[row.RoleID] = row.Total
	}
	return out, nil
}

// replacePermissions swaps a role's permission set wholesale. Callers run it
// inside a transaction so the role is never left with a partial set.
func replacePermissions(tx *gorm.DB, roleID int64, permissionIDs []int64) error {
	if err := tx.Where("role_id = ?", roleID).Delete(&models.RolePermissionModel{}).Error; err != nil {
		return err
	}
	if len(permissionIDs) == 0 {
		return nil
	}

	seen := make(map[int64]bool, len(permissionIDs))
	links := make([]models.RolePermissionModel, 0, len(permissionIDs))
	for _, pid := range permissionIDs {
		if seen[pid] {
			continue
		}
		seen[pid] = true
		links = append(links, models.RolePermissionModel{RoleID: roleID, PermissionID: pid})
	}
	return tx.Create(&links).Error
}
