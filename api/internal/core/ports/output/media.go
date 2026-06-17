package output

import (
	"apcms/internal/pkg/query"
	"context"

	"apcms/internal/core/domain"
)

type MediaRepository interface {
	FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Media, int64, error)
	FindByID(ctx context.Context, id int64) (*domain.Media, error)
	Create(ctx context.Context, w *domain.MediaWrite) (int64, error)
}
