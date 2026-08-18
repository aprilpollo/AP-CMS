package domain

import (
	"io"
	"time"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

type AuditEntry struct {
	UserID     *int64
	ActionCode string // matches audit_actions.code, e.g. "login"
	EntityType string
	EntityID   *int64
	IP         string
}

type MeResult struct {
	User        *User    `json:"user"`
	Permissions []string `json:"permissions"`
}

type UploadAvatar struct {
	File io.Reader 
	Size int64
	ContentType string
}

// Session is one signed-in device, derived from the refresh tokens in Redis.
type Session struct {
	ID         string    `json:"id"`
	UserAgent  string    `json:"user_agent"`
	IP         string    `json:"ip"`
	CreatedAt  time.Time `json:"created_at"`
	LastSeenAt time.Time `json:"last_seen_at"`
	Current    bool      `json:"current"`
}

// AuditRecord is one row of the activity feed.
type AuditRecord struct {
	ID         int64     `json:"id"`
	ActionCode string    `json:"action_code"`
	ActionName string    `json:"action_name"`
	EntityType string    `json:"entity_type"`
	EntityID   *int64    `json:"entity_id"`
	IP         *string   `json:"ip"`
	CreatedAt  time.Time `json:"created_at"`
}
