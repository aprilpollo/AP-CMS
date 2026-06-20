package models

// PostCategoriesModel is the posts ⇄ categories junction table.
type PostCategoriesModel struct {
	PostID     int64 `gorm:"primaryKey"`
	CategoryID int64 `gorm:"primaryKey;index"`

	Post     *PostModel     `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Category *CategoriesModel `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (PostCategoriesModel) TableName() string { return "post_categories" }
