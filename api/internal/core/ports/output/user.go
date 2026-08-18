package output

import (
	"context"
	"time"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)

// UserRepository is the output port — defines how the core communicates with storage.
type UserRepository interface {
	FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.User, int64, error)
	FindByID(ctx context.Context, id int64) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	Save(ctx context.Context, user *domain.UserCreate) (*domain.User, error)
	Update(ctx context.Context, id int64, user *domain.UserUpdate) error
	UpdatePassword(ctx context.Context, id, passwordHash string) error
	UpdateAvatar(ctx context.Context, id int64, avatarURL string) error
	UpdateLastLogin(ctx context.Context, id int64, at time.Time) error
	Delete(ctx context.Context, id int64) error
	CountByRoleID(ctx context.Context, roleID int64) (int64, error)
}
