package services

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
)

type categoriesService struct {
	repo output.CategoriesRepository
}

func NewCategoriesService(repo output.CategoriesRepository) input.CategoriesService {
	return &categoriesService{repo: repo}
}

func (s *categoriesService) Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Category, int64, error) {
	categories, total, err := s.repo.FindAll(ctx, opts)
	if err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (s *categoriesService) Create(ctx context.Context, in *domain.CreateCategoriesInput) (*domain.Category, error) {
	if in.Slug != nil {
		slugExists, err := s.repo.SlugExists(ctx, *in.Slug)
		if err != nil {
			return nil, err
		}
		if slugExists {
			return nil, domain.ErrSlugAlreadyExists
		}
	}

	category, err := s.repo.Create(ctx, in)
	if err != nil {
		return nil, err
	}
	return category, nil
}

func (s *categoriesService) SlugExists(ctx context.Context, slug string) (bool, error) {
	slugExists, err := s.repo.SlugExists(ctx, slug)
	if err != nil {
		return false, err
	}
	return slugExists, nil
}