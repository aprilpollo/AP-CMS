package input

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)


type UserService interface {
	List(ctx context.Context, opts query.QueryOptions) ([]domain.User, int64, error)
	GetByID(ctx context.Context, id int64) (*domain.User, error)
	Create(ctx context.Context, in *domain.UserCreate) error
}
