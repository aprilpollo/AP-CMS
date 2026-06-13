package output

import (
	"context"
	"time"

	"apcms/internal/core/domain"
)

// SessionStore persists refresh tokens and login rate-limit counters (Redis).
type SessionStore interface {
	SaveRefresh(ctx context.Context, token, userID string, ttl time.Duration) error
	GetRefreshUserID(ctx context.Context, token string) (string, error)
	DeleteRefresh(ctx context.Context, token string) error

	LoginFailCount(ctx context.Context, ip string) (int64, error)
	IncrLoginFail(ctx context.Context, ip string, ttl time.Duration) (int64, error)
	ResetLoginFail(ctx context.Context, ip string) error

	SaveResetToken(ctx context.Context, token, userID string, ttl time.Duration) error
	GetResetUserID(ctx context.Context, token string) (string, error)
	DeleteResetToken(ctx context.Context, token string) error

	// Email-change verification: value is "<userID>|<newEmail>".
	SaveEmailToken(ctx context.Context, token, value string, ttl time.Duration) error
	GetEmailToken(ctx context.Context, token string) (string, error)
	DeleteEmailToken(ctx context.Context, token string) error
}

// AuthzRepository resolves the effective permission slugs for a user (RBAC).
type AuthzRepository interface {
	PermissionsByUserID(ctx context.Context, userID int64) ([]string, error)
}

// AuditRepository persists audit-log entries.
type AuditRepository interface {
	Log(ctx context.Context, entry domain.AuditEntry) error
}
