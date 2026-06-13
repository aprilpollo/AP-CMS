package models

type TagModel struct {
	ID   int64  `gorm:"primaryKey;autoIncrement"`
	Name string `gorm:"not null"`
	Slug string `gorm:"uniqueIndex;not null"`
}

func (TagModel) TableName() string { return "tags" }
