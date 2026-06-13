package models

import "time"

// AuditLogModel is an append-only log ordered chronologically, so it uses an
// auto-increment PK.
type AuditLogModel struct {
	ID     int64  `gorm:"primaryKey;autoIncrement"`
	UserID *int64 `gorm:"index"`

	ActionID int64             `gorm:"not null;index"`
	Action   *AuditActionModel `gorm:"foreignKey:ActionID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	EntityType string    `gorm:"not null;index:idx_audit_entity,priority:1"`
	EntityID   *int64    `gorm:"index:idx_audit_entity,priority:2"`
	OldValue   []byte    `gorm:"type:jsonb"`
	NewValue   []byte    `gorm:"type:jsonb"`
	IPAddress  *string   `gorm:"type:inet"`
	CreatedAt  time.Time `gorm:"not null;default:now();index"`

	User *UserModel `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (AuditLogModel) TableName() string { return "audit_logs" }
