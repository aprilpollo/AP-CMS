package models

// Lookup tables — replace the former Postgres ENUM types. Each holds a stable
// They use auto-increment integer PKs: small fixed reference sets that are pure
// FK targets and benefit from compact keys and natural ordering.

type PostStatusModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (PostStatusModel) TableName() string { return "post_statuses" }

type PostTypeModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (PostTypeModel) TableName() string { return "post_types" }

type ContentFormatModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (ContentFormatModel) TableName() string { return "content_formats" }

type CommentStatusModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (CommentStatusModel) TableName() string { return "comment_statuses" }

type SettingTypeModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (SettingTypeModel) TableName() string { return "setting_types" }

type AuditActionModel struct {
	ID    int64  `gorm:"primaryKey"`
	Code  string `gorm:"uniqueIndex;not null"`
	Label string `gorm:"not null"`
}

func (AuditActionModel) TableName() string { return "audit_actions" }
