package domain

import "errors"

var ErrSlugAlreadyExists = errors.New("slug already exists")

type Category struct {
	ID          int64      `json:"id"`
	ParentID    *int64     `json:"parent_id,omitempty"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Description *string    `json:"description,omitempty"`
	SortOrder   int        `json:"sort_order"`
	// Children    []Category `json:"children,omitempty"`
}

type CreateCategoriesInput struct {
	Name        string
	Slug        *string
	ParentID    *int64
	Description *string
	SortOrder   int
}