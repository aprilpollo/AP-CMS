package models

import "time"

// PostRevisionModel mirrors a post's content for each saved version.
// Append-only and ordered chronologically, so it uses an auto-increment PK.
type PostRevisionModel struct {
	ID            int64  `gorm:"primaryKey;autoIncrement"`
	PostID        int64  `gorm:"not null;index"`
	EditorID      *int64 `gorm:"index"`
	Content       *string
	ContentBlocks []byte `gorm:"type:jsonb"`

	ContentFormatID int64               `gorm:"not null;index"`
	ContentFormat   *ContentFormatModel `gorm:"foreignKey:ContentFormatID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	RevisionNote *string
	CreatedAt    time.Time `gorm:"not null;default:now()"`

	Post   *PostModel `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Editor *UserModel `gorm:"foreignKey:EditorID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (PostRevisionModel) TableName() string { return "post_revisions" }
