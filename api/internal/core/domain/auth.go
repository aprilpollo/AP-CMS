package domain

import "io"

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