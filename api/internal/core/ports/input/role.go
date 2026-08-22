package input

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)

type RoleService interface {
	Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Role, int64, error)
	GetByID(ctx context.Context, id int64) (*domain.Role, error)
	GetsPermissions(ctx context.Context, opts query.QueryOptions) ([]domain.Permission, int64, error)
	Create(ctx context.Context, in *domain.CreateRoleInput) (*domain.Role, error)
	Update(ctx context.Context, id int64, in *domain.UpdateRoleInput) (*domain.Role, error)
	SetPermissions(ctx context.Context, id int64, in *domain.SetRolePermissionsInput) (*domain.Role, error)
	Delete(ctx context.Context, id int64) error
}
