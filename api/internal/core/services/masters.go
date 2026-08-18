package services

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
)

type masterService struct {
	repo output.MasterRepository
}

func NewMasterService(repo output.MasterRepository) input.MasterService {
	return &masterService{repo: repo}
}

func (s *masterService) GetsRoles(ctx context.Context, opts query.QueryOptions) ([]domain.MasterRole, int64, error) {
	roles, total, err := s.repo.FindAllRoles(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return roles, total, nil
}

func (s *masterService) GetsPostStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostStatus, int64, error) {
	statuses, total, err := s.repo.FindAllPostStatuses(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return statuses, total, nil
}

func (s *masterService) GetsPostTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostType, int64, error) {
	types, total, err := s.repo.FindAllPostTypes(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return types, total, nil
}

func (s *masterService) GetsContentFormats(ctx context.Context, opts query.QueryOptions) ([]domain.MasterContentFormat, int64, error) {
	formats, total, err := s.repo.FindAllContentFormats(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return formats, total, nil
}

func (s *masterService) GetsCommentStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterCommentStatus, int64, error) {
	statuses, total, err := s.repo.FindAllCommentStatuses(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return statuses, total, nil
}

func (s *masterService) GetsSettingTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterSettingType, int64, error) {
	types, total, err := s.repo.FindAllSettingTypes(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return types, total, nil
}

func (s *masterService) GetsAuditActions(ctx context.Context, opts query.QueryOptions) ([]domain.MasterAuditAction, int64, error) {
	actions, total, err := s.repo.FindAllAuditActions(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return actions, total, nil
}
