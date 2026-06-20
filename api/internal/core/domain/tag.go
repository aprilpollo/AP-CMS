package domain

type Tag struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	//PostCount int64  `json:"post_count,omitempty"`
}