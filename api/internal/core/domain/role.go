package domain

// Permission is a single RBAC capability (e.g. "users.manage").
type Permission struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

// Role groups a set of permissions.
type Role struct {
	ID          int64        `json:"id"`
	Name        string       `json:"name"`
	Slug        string       `json:"slug"`
	Permissions []Permission `json:"permissions,omitempty"`
}
