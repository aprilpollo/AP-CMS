package domain

import "time"

type MasterRole struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
}

type MasterPostStatus struct {
	ID    int64  `json:"id"`
	Code  string `json:"code"`
	Label string `json:"label"`
}

type MasterPostType struct {
	ID    int64  `json:"id"`
	Code  string `json:"code"`
	Label string `json:"label"`
}

type MasterContentFormat struct {
	ID    int64  `json:"id"`
	Code  string `json:"code"`
	Label string `json:"label"`
}

type MasterCommentStatus struct {
	ID    int64  `json:"id"`
	Code  string `json:"code"`
	Label string `json:"label"`
}

type MasterSettingType struct {
	ID    int64  `json:"id"`
	Code  string `json:"code"`
	Label string `json:"label"`
}

type MasterAuditAction struct {
	ID    int64  `json:"id"`
	Code  string `json:"code"`
	Label string `json:"label"`
}
