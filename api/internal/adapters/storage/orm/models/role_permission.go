package models

// RolePermissionModel is the roles ⇄ permissions junction table.
type RolePermissionModel struct {
	RoleID       int64 `gorm:"primaryKey"`
	PermissionID int64 `gorm:"primaryKey"`

	Role       *RoleModel       `gorm:"foreignKey:RoleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Permission *PermissionModel `gorm:"foreignKey:PermissionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (RolePermissionModel) TableName() string { return "role_permissions" }
