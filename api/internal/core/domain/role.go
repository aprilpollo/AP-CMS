package domain

import (
	"errors"
	"time"
)

var (
	ErrRoleNotFound       = errors.New("role not found")
	ErrRoleSlugExists     = errors.New("role slug already exists")
	ErrRoleInUse          = errors.New("role is still assigned to users")
	ErrRoleProtected      = errors.New("this role is protected and cannot be changed")
	ErrRoleNameRequired   = errors.New("role name is required")
	ErrPermissionNotFound = errors.New("one or more permissions do not exist")
)

// ProtectedRoleSlugs lists roles the system relies on. They can be renamed and
// recoloured, but never re-slugged, stripped of permissions, or deleted —
// losing "admin" would lock everyone out of the control panel.
var ProtectedRoleSlugs = map[string]bool{"admin": true}

// IsProtectedRole reports whether the slug belongs to a system role.
func IsProtectedRole(slug string) bool { return ProtectedRoleSlugs[slug] }

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
	Color       string       `json:"color,omitempty"`
	UserCount   int64        `json:"user_count,omitempty"`
	CreatedAt   *time.Time   `json:"created_at,omitempty"`
	Permissions []Permission `json:"permissions,omitempty"`
}

// CreateRoleInput is the payload for POST /roles.
type CreateRoleInput struct {
	Name          string  `json:"name"`
	Slug          *string `json:"slug"`
	Color         *string `json:"color"`
	PermissionIDs []int64 `json:"permission_ids"`
}

// UpdateRoleInput is the payload for PUT /roles/:id. Nil fields stay unchanged.
type UpdateRoleInput struct {
	Name  *string `json:"name"`
	Slug  *string `json:"slug"`
	Color *string `json:"color"`
}

// SetRolePermissionsInput is the payload for PUT /roles/:id/permissions. It
// replaces the role's permission set wholesale.
type SetRolePermissionsInput struct {
	PermissionIDs []int64 `json:"permission_ids"`
}
