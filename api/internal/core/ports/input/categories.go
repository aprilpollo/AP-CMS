package input

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)

type CategoriesService interface {
	Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Category, int64, error)
	Create(ctx context.Context, in *domain.CreateCategoriesInput) (*domain.Category, error)
	SlugExists(ctx context.Context, slug string) (bool, error)

}