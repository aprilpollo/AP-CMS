package models

import "apcms/internal/core/domain"

// CategoriesModel is hierarchical via the self-referencing ParentID.
type CategoriesModel struct {
	ID          int64  `gorm:"primaryKey;autoIncrement"`
	ParentID    *int64 `gorm:"index"`
	Name        string `gorm:"not null"`
	Slug        string `gorm:"uniqueIndex;not null"`
	Description *string
	SortOrder   int `gorm:"not null;default:0"`

	Parent *CategoriesModel `gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (CategoriesModel) TableName() string { return "categories" }


func (m *CategoriesModel) ToDomain() *domain.Category {
	return &domain.Category{
		ID:          m.ID,
		ParentID:    m.ParentID,
		Name:        m.Name,
		Slug:        m.Slug,
		Description: m.Description,
		SortOrder:   m.SortOrder,
	}
}