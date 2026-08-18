package input

import (
	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
	"context"
)

type MasterService interface {
	GetsRoles(ctx context.Context, opts query.QueryOptions) ([]domain.MasterRole, int64, error)
	GetsPostStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostStatus, int64, error)
	GetsPostTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostType, int64, error)
	GetsContentFormats(ctx context.Context, opts query.QueryOptions) ([]domain.MasterContentFormat, int64, error)
	GetsCommentStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterCommentStatus, int64, error)
	GetsSettingTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterSettingType, int64, error)
	GetsAuditActions(ctx context.Context, opts query.QueryOptions) ([]domain.MasterAuditAction, int64, error)
}
