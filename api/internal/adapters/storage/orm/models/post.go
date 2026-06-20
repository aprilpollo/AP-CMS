package models

import "time"

// PostModel stores either markdown (Content) or block (ContentBlocks JSONB)
// content, selected by the ContentFormat lookup.
type PostModel struct {
	ID            int64  `gorm:"primaryKey;autoIncrement"`
	AuthorID      *int64 `gorm:"index"`
	Title         string `gorm:"not null"`
	Slug          string `gorm:"uniqueIndex;not null"`
	Content       *string
	ContentBlocks []byte `gorm:"type:jsonb"`

	ContentFormatID int64               `gorm:"not null;index"`
	ContentFormat   *ContentFormatModel `gorm:"foreignKey:ContentFormatID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Excerpt *string

	StatusID int64            `gorm:"not null;index"`
	Status   *PostStatusModel `gorm:"foreignKey:StatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	PostTypeID int64          `gorm:"not null;index"`
	PostType   *PostTypeModel `gorm:"foreignKey:PostTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	FeaturedImageURL *string
	ReadingTimeMin   *int
	PublishedAt      *time.Time `gorm:"index"`
	CreatedAt        time.Time  `gorm:"not null;default:now()"`
	UpdatedAt        time.Time  `gorm:"not null;default:now()"`

	Author *UserModel `gorm:"foreignKey:AuthorID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	// Categories (m2m) are managed via PostCategoriesModel and the vw_post view,
	// mirroring how tags are handled — no GORM association is declared here.
}

func (PostModel) TableName() string { return "posts" }
