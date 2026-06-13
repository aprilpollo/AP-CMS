package models

import "time"

type RoleModel struct {
	ID        int64     `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	Slug      string    `gorm:"uniqueIndex;not null"`
	CreatedAt time.Time `gorm:"not null;default:now()"`
}

func (RoleModel) TableName() string { return "roles" }
