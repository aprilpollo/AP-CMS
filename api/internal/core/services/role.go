package services

import (
	"context"
	"strconv"
	"strings"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"apcms/internal/pkg/slug"

	"github.com/google/uuid"
)

type roleService struct {
	repo output.RoleRepository
}

func NewRoleService(repo output.RoleRepository) input.RoleService {
	return &roleService{repo: repo}
}

func (s *roleService) Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Role, int64, error) {
	return s.repo.FindAll(ctx, opts)
}

func (s *roleService) GetByID(ctx context.Context, id int64) (*domain.Role, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *roleService) GetsPermissions(ctx context.Context, opts query.QueryOptions) ([]domain.Permission, int64, error) {
	return s.repo.FindAllPermissions(ctx, opts)
}

func (s *roleService) Create(ctx context.Context, in *domain.CreateRoleInput) (*domain.Role, error) {
	in.Name = strings.TrimSpace(in.Name)
	if in.Name == "" {
		return nil, domain.ErrRoleNameRequired
	}

	if in.Slug != nil && strings.TrimSpace(*in.Slug) != "" {
		candidate := slug.Make(*in.Slug)
		exists, err := s.repo.SlugExists(ctx, candidate, 0)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, domain.ErrRoleSlugExists
		}
		in.Slug = &candidate
	} else {
		finalSlug, err := s.uniqueSlug(ctx, in.Name)
		if err != nil {
			return nil, err
		}
		in.Slug = &finalSlug
	}

	if err := s.assertPermissionsExist(ctx, in.PermissionIDs); err != nil {
		return nil, err
	}

	return s.repo.Create(ctx, in)
}

func (s *roleService) Update(ctx context.Context, id int64, in *domain.UpdateRoleInput) (*domain.Role, error) {
	current, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if in.Name != nil {
		name := strings.TrimSpace(*in.Name)
		if name == "" {
			return nil, domain.ErrRoleNameRequired
		}
		in.Name = &name
	}

	if in.Slug != nil {
		candidate := slug.Make(*in.Slug)
		if candidate != current.Slug {
			// System roles are referenced by slug in code (auth guards, seeds),
			// so re-slugging one would silently break those checks.
			if domain.IsProtectedRole(current.Slug) {
				return nil, domain.ErrRoleProtected
			}
			exists, err := s.repo.SlugExists(ctx, candidate, id)
			if err != nil {
				return nil, err
			}
			if exists {
				return nil, domain.ErrRoleSlugExists
			}
		}
		in.Slug = &candidate
	}

	return s.repo.Update(ctx, id, in)
}

func (s *roleService) SetPermissions(ctx context.Context, id int64, in *domain.SetRolePermissionsInput) (*domain.Role, error) {
	current, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	// The admin role keeps every permission — trimming it could leave nobody
	// able to manage roles or users.
	if domain.IsProtectedRole(current.Slug) {
		return nil, domain.ErrRoleProtected
	}

	if err := s.assertPermissionsExist(ctx, in.PermissionIDs); err != nil {
		return nil, err
	}

	if err := s.repo.SetPermissions(ctx, id, in.PermissionIDs); err != nil {
		return nil, err
	}

	return s.repo.FindByID(ctx, id)
}

func (s *roleService) Delete(ctx context.Context, id int64) error {
	current, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if domain.IsProtectedRole(current.Slug) {
		return domain.ErrRoleProtected
	}

	count, err := s.repo.CountUsers(ctx, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return domain.ErrRoleInUse
	}

	return s.repo.Delete(ctx, id)
}

func (s *roleService) assertPermissionsExist(ctx context.Context, ids []int64) error {
	ok, err := s.repo.PermissionIDsExist(ctx, ids)
	if err != nil {
		return err
	}
	if !ok {
		return domain.ErrPermissionNotFound
	}
	return nil
}

func (s *roleService) uniqueSlug(ctx context.Context, base string) (string, error) {
	candidate := slug.Make(base)
	if candidate == "" {
		candidate = "role-" + uuid.NewString()[:8]
	}

	root := candidate
	for i := 2; ; i++ {
		exists, err := s.repo.SlugExists(ctx, candidate, 0)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = root + "-" + strconv.Itoa(i)
	}
}
