package output

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)

// RoleRepository is the output port for role / permission storage.
type RoleRepository interface {
	FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Role, int64, error)
	FindByID(ctx context.Context, id int64) (*domain.Role, error)
	FindAllPermissions(ctx context.Context, opts query.QueryOptions) ([]domain.Permission, int64, error)
	// PermissionIDsExist reports whether every id resolves to a permission row.
	PermissionIDsExist(ctx context.Context, ids []int64) (bool, error)
	SlugExists(ctx context.Context, slug string, excludeID int64) (bool, error)
	Create(ctx context.Context, in *domain.CreateRoleInput) (*domain.Role, error)
	Update(ctx context.Context, id int64, in *domain.UpdateRoleInput) (*domain.Role, error)
	// SetPermissions replaces the role's permission set in one transaction.
	SetPermissions(ctx context.Context, id int64, permissionIDs []int64) error
	Delete(ctx context.Context, id int64) error
	CountUsers(ctx context.Context, id int64) (int64, error)
}
