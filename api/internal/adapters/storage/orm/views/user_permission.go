package views

// vwUserPermission resolves a user's effective permission slugs through their
// role, folding the users → role_permissions → permissions join into one view.
const vwUserPermission = `CREATE VIEW vw_user_permission AS
SELECT
    u.id AS user_id,
    p.slug
FROM users u
JOIN role_permissions rp ON rp.role_id = u.role_id
JOIN permissions p ON p.id = rp.permission_id`

// VWUserPermission is the read model backed by the vw_user_permission SQL view.
type VWUserPermission struct {
	UserID int64  `gorm:"column:user_id"`
	Slug   string `gorm:"column:slug"`
}

func (VWUserPermission) TableName() string { return "vw_user_permission" }
