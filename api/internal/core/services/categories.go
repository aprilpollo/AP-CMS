package services

import (
	"context"
	"strconv"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"apcms/internal/pkg/slug"

	"github.com/google/uuid"
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
	if in.Slug != nil && *in.Slug != "" {
		slugExists, err := s.repo.SlugExists(ctx, *in.Slug)
		if err != nil {
			return nil, err
		}
		if slugExists {
			return nil, domain.ErrSlugAlreadyExists
		}
	} else {
		finalSlug, err := s.uniqueSlug(ctx, in.Name)
		if err != nil {
			return nil, err
		}
		in.Slug = &finalSlug
	}

	category, err := s.repo.Create(ctx, in)
	if err != nil {
		return nil, err
	}
	return category, nil
}

func (s *categoriesService) uniqueSlug(ctx context.Context, base string) (string, error) {
	candidate := slug.Make(base)
	if candidate == "" {
		candidate = "category-" + uuid.NewString()[:8]
	}

	root := candidate
	for i := 2; ; i++ {
		exists, err := s.repo.SlugExists(ctx, candidate)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = root + "-" + strconv.Itoa(i)
	}
}

func (s *categoriesService) SlugExists(ctx context.Context, slug string) (bool, error) {
	slugExists, err := s.repo.SlugExists(ctx, slug)
	if err != nil {
		return false, err
	}
	return slugExists, nil
}