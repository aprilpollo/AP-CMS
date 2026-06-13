package models

// CategoryModel is hierarchical via the self-referencing ParentID.
type CategoryModel struct {
	ID          int64  `gorm:"primaryKey;autoIncrement"`
	ParentID    *int64 `gorm:"index"`
	Name        string `gorm:"not null"`
	Slug        string `gorm:"uniqueIndex;not null"`
	Description *string
	SortOrder   int `gorm:"not null;default:0"`

	Parent *CategoryModel `gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (CategoryModel) TableName() string { return "categories" }
