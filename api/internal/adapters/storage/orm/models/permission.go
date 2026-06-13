package models

type PermissionModel struct {
	ID   int64  `gorm:"primaryKey"`
	Name string `gorm:"not null"`
	Slug string `gorm:"uniqueIndex;not null"`
}

func (PermissionModel) TableName() string { return "permissions" }
