package models

// PostCategoryModel is the posts ⇄ categories junction table.
type PostCategoryModel struct {
	PostID     int64 `gorm:"primaryKey"`
	CategoryID int64 `gorm:"primaryKey;index"`

	Post     *PostModel     `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Category *CategoryModel `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (PostCategoryModel) TableName() string { return "post_categories" }
