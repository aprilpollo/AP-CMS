package models

import (
	"apcms/internal/core/domain"
)
type TagModel struct {
	ID   int64  `gorm:"primaryKey;autoIncrement"`
	Name string `gorm:"not null"`
	Slug string `gorm:"uniqueIndex;not null"`
}

func (TagModel) TableName() string { return "tags" }

func (m *TagModel) ToDomain() *domain.Tag {
	return &domain.Tag{
		ID:   m.ID,
		Name: m.Name,
		Slug: m.Slug,
	}
}