package models

// PostMetaModel holds arbitrary key/value custom fields per post.
type PostMetaModel struct {
	ID        int64  `gorm:"primaryKey;autoIncrement"`
	PostID    int64  `gorm:"not null;index;uniqueIndex:uq_post_meta_post_key,priority:1"`
	MetaKey   string `gorm:"not null;index;uniqueIndex:uq_post_meta_post_key,priority:2"`
	MetaValue *string

	Post *PostModel `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (PostMetaModel) TableName() string { return "post_meta" }
