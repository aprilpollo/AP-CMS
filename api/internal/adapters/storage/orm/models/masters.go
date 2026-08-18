package models

import "time"

type RoleModel struct {
	ID        int64     `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	Slug      string    `gorm:"uniqueIndex;not null"`
	Color     string    `gorm:"default:'#000000'"`
	CreatedAt time.Time `gorm:"not null;default:now()"`
}

type PostStatusModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

type PostTypeModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

type ContentFormatModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

type CommentStatusModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

type SettingTypeModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

type AuditActionModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (RoleModel) TableName() string          { return "roles" }
func (PostStatusModel) TableName() string    { return "post_statuses" }
func (PostTypeModel) TableName() string      { return "post_types" }
func (ContentFormatModel) TableName() string { return "content_formats" }
func (CommentStatusModel) TableName() string { return "comment_statuses" }
func (SettingTypeModel) TableName() string   { return "setting_types" }
func (AuditActionModel) TableName() string   { return "audit_actions" }

