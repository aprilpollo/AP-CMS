package views

// vwRolePermission flattens the role_permissions join so a role's permissions
// can be read directly, without joining permissions at query time.
const vwRolePermission = `CREATE VIEW vw_role_permission AS
SELECT
    rp.role_id,
    p.id,
    p.name,
    p.slug
FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id`

// VWRolePermission is the read model backed by the vw_role_permission SQL view.
type VWRolePermission struct {
	RoleID int64  `gorm:"column:role_id"`
	ID     int64  `gorm:"column:id"`
	Name   string `gorm:"column:name"`
	Slug   string `gorm:"column:slug"`
}

func (VWRolePermission) TableName() string { return "vw_role_permission" }
