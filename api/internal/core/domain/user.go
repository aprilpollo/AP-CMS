package domain

import "time"

type User struct {
	ID           int64      `json:"id"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	DisplayName  string     `json:"display_name"`
	FirstName    string     `json:"first_name"`
	LastName     string     `json:"last_name"`
	Bio          *string    `json:"bio"`
	AvatarURL    *string    `json:"avatar_url"`
	RoleID       int64      `json:"role_id"`
	Role         *Role      `json:"role"`
	IsActive     bool       `json:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type UserCreate struct {
	Email       string  `json:"email"`
	DisplayName string  `json:"display_name"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	Bio         *string `json:"bio"`
	RoleID      int64   `json:"role_id"`
	Password    string  `json:"password"`
}

type UserUpdate struct {
	Email       *string `json:"email"`
	DisplayName *string `json:"display_name"`
	FirstName   *string `json:"first_name"`
	LastName    *string `json:"last_name"`
	Bio         *string `json:"bio"`
	RoleID      *int64  `json:"role_id"`
}
