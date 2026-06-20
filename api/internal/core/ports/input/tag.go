package input

import (
	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
	"context"
)

type TagService interface {
	Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Tag, int64, error)
}
