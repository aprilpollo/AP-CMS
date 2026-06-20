package services

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
)

type tagService struct {
	repo output.TagRepository
}

func NewTagService(repo output.TagRepository) input.TagService {
	return &tagService{repo: repo}
}

func (s *tagService) Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Tag, int64, error) {
	tags, total, err := s.repo.FindAll(ctx, opts)
	if err != nil {
		return nil, 0, err
	}

	return tags, total, nil
}