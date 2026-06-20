package input

import (
	"context"

	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
)

type PostService interface {
	Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Post, int64, error)
	GetBySlug(ctx context.Context, slug string) (*domain.Post, error)
	Create(ctx context.Context, in *domain.CreatePostInput) (*domain.Post, error)
	Update(ctx context.Context, id int64, actor *domain.Actor, in *domain.UpdatePostInput) (*domain.Post, error)
	Delete(ctx context.Context, id int64, actor *domain.Actor) error

	ChangeStatus(ctx context.Context, id int64, actor *domain.Actor, status string) (*domain.Post, error)

	ListRevisions(ctx context.Context, postID int64) ([]domain.PostRevision, error)
	RestoreRevision(ctx context.Context, postID, revisionID int64, actor *domain.Actor) (*domain.Post, error)
}
