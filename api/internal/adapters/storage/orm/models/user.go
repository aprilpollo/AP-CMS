package models

import (
	"apcms/internal/core/domain"
	"gorm.io/gorm"
	"time"
)

type UserModel struct {
	ID           int64  `gorm:"primaryKey;autoIncrement"`
	Email        string `gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	DisplayName  string `gorm:"not null"`
	FirstName    string `gorm:"not null"`
	LastName     string `gorm:"not null"`
	Bio          *string
	AvatarURL    *string
	RoleID       int64 `gorm:"index"`
	IsActive     bool  `gorm:"not null;default:true"`
	LastLoginAt  *time.Time
	CreatedAt    time.Time      `gorm:"not null;default:now()"`
	UpdatedAt    time.Time      `gorm:"not null;default:now()"`
	DeletedAt    gorm.DeletedAt `gorm:"index"`

	Role *RoleModel `gorm:"foreignKey:RoleID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (UserModel) TableName() string { return "users" }

func (m *UserModel) ToDomain() *domain.User {
	u := &domain.User{
		ID:           m.ID,
		Email:        m.Email,
		PasswordHash: m.PasswordHash,
		DisplayName:  m.DisplayName,
		FirstName:    m.FirstName,
		LastName:     m.LastName,
		AvatarURL:    m.AvatarURL,
		Bio:          m.Bio,
		RoleID:       m.RoleID,
		IsActive:     m.IsActive,
		LastLoginAt:  m.LastLoginAt,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
	if m.Role != nil {
		u.Role = &domain.Role{ID: m.Role.ID, Name: m.Role.Name, Slug: m.Role.Slug}
	}
	return u
}
