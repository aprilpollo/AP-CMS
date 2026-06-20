package output

import (
	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
	"context"
)

type TagRepository interface {
	FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Tag, int64, error)
	FindOrCreate(ctx context.Context, names []string) ([]int64, error)
}