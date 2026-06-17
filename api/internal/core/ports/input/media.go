package input

import (
	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
	"context"
)

type MediaService interface {
	List(ctx context.Context, opts query.QueryOptions) ([]domain.Media, int64, error)
	Upload(ctx context.Context, in *domain.UploadMediaInput) (*domain.Media, error)
}
