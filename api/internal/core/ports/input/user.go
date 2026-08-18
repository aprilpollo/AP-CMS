package input

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)


type UserService interface {
	List(ctx context.Context, opts query.QueryOptions) ([]domain.User, int64, error)
	GetByID(ctx context.Context, id int64) (*domain.User, error)
	Create(ctx context.Context, in *domain.UserCreate) (*domain.User, error)
	Update(ctx context.Context, id int64, in *domain.UserUpdate) error
	Delete(ctx context.Context, id int64) error
	SetPassword(ctx context.Context, id int64, password string) error

	ListSessions(ctx context.Context, id int64) ([]domain.Session, error)
	RevokeSession(ctx context.Context, id int64, sessionID string) error
	ListActivity(ctx context.Context, id int64, limit int) ([]domain.AuditRecord, error)
	UploadAvatar(ctx context.Context, id int64, file domain.UploadAvatar) (string, error)
	SendInvite(ctx context.Context, id int64) error
	EmailAvailable(ctx context.Context, email string) (bool, error)
}
