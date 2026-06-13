package models

import "time"

// CommentModel supports nesting via the self-referencing ParentID.
type CommentModel struct {
	ID       int64  `gorm:"primaryKey;autoIncrement"`
	PostID   int64  `gorm:"not null;index"`
	AuthorID *int64 `gorm:"index"`
	ParentID *int64 `gorm:"index"`
	Content  string `gorm:"not null"`

	StatusID int64               `gorm:"not null;index"`
	Status   *CommentStatusModel `gorm:"foreignKey:StatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	CreatedAt time.Time `gorm:"not null;default:now()"`
	UpdatedAt time.Time `gorm:"not null;default:now()"`

	Post   *PostModel    `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Author *UserModel    `gorm:"foreignKey:AuthorID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Parent *CommentModel `gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (CommentModel) TableName() string { return "comments" }
