package output

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)

// CategoriesRepository is the output port for category storage.
type CategoriesRepository interface {
	FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Category, int64, error)
	Create(ctx context.Context, in *domain.CreateCategoriesInput) (*domain.Category, error)
	SlugExists(ctx context.Context, slug string) (bool, error)
}
