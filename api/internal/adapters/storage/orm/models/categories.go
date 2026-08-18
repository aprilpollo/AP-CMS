package models

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


