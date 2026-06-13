package models

// PostTagModel is the posts ⇄ tags junction table.
type PostTagModel struct {
	PostID int64 `gorm:"primaryKey"`
	TagID  int64 `gorm:"primaryKey;index"`

	Post *PostModel `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Tag  *TagModel  `gorm:"foreignKey:TagID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (PostTagModel) TableName() string { return "post_tags" }
