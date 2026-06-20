package domain

import "time"

type Post struct {
	ID               int64      `json:"id"`
	Title            string     `json:"title"`
	Slug             string     `json:"slug"`
	Content          *string    `json:"content"`
	ContentFormat    string     `json:"content_format"`
	Excerpt          *string    `json:"excerpt"`
	Status           string     `json:"status"`
	Type             string     `json:"type"`
	FeaturedImageURL *string    `json:"featured_image_url"`
	ReadingTimeMin   *int       `json:"reading_time_min"`
	AuthorID         *int64     `json:"author_id"`
	Author           *User      `json:"author"`
	Categories       []Category `json:"categories"`
	Tags             []Tag      `json:"tags"`
	PublishedAt      *time.Time `json:"published_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type CreatePostInput struct {
	Title            string
	Slug             *string
	Content          *string
	ContentFormat    *string // default "markdown"
	Excerpt          *string
	Type             *string // default "post"
	CategoryIDs      []int64
	Tags             []string // tag names; created on demand
	FeaturedImageURL *string
	AuthorID         int64
}

type PostWrite struct {
	AuthorID         *int64
	CategoryIDs      []int64
	Title            string
	Slug             string
	Content          *string
	ContentFormatID  int64
	Excerpt          *string
	StatusID         int64
	PostTypeID       int64
	FeaturedImageURL *string
	TagIDs           []int64
}

type UpdatePostInput struct {
	Title            *string
	Content          *string
	ContentFormat    *string
	Excerpt          *string
	CategoryIDs      *[]int64
	Tags             *[]string
	FeaturedImageURL *string
}

type PostUpdate struct {
	Title            *string  `json:"title"`
	Content          *string  `json:"content"`
	ContentFormatID  *int64   `json:"content_format_id"`
	Excerpt          *string  `json:"excerpt"`
	FeaturedImageURL *string  `json:"featured_image_url"`
	TagIDs           *[]int64 `json:"-"`
	CategoryIDs      *[]int64 `json:"-"`
}

type Actor struct {
	UserID       int64
	CanEditAny   bool
	CanDeleteAny bool
}

type ChangePostStatusInput struct {
	Status string `json:"status"`
}

type PostRevision struct {
	ID            int64     `json:"id"`
	PostID        int64     `json:"post_id"`
	EditorID      *int64    `json:"editor_id,omitempty"`
	Content       *string   `json:"content,omitempty"`
	ContentFormat string    `json:"content_format"`
	RevisionNote  *string   `json:"revision_note,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}