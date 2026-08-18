package output

import (
	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
	"context"
)

type MasterRepository interface {
	FindAllRoles(ctx context.Context, opts query.QueryOptions) ([]domain.MasterRole, int64, error)
	FindAllPostStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostStatus, int64, error)
	FindAllPostTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostType, int64, error)
	FindAllContentFormats(ctx context.Context, opts query.QueryOptions) ([]domain.MasterContentFormat, int64, error)
	FindAllCommentStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterCommentStatus, int64, error)
	FindAllSettingTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterSettingType, int64, error)
	FindAllAuditActions(ctx context.Context, opts query.QueryOptions) ([]domain.MasterAuditAction, int64, error)
}