package output

import (
	"apcms/internal/core/domain"
	"apcms/internal/pkg/query"
	"context"
	"time"
)

type PostRepository interface {
	FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Post, int64, error)
	FindByID(ctx context.Context, id int64) (*domain.Post, error)
	FindBySlug(ctx context.Context, slug string) (*domain.Post, error)
	SlugExists(ctx context.Context, slug, excludeID string) (bool, error)
	Create(ctx context.Context, post *domain.PostWrite) (int64, error)
	Update(ctx context.Context, id int64, post *domain.PostUpdate) error
	UpdateStatus(ctx context.Context, id int64, statusID int64, publishedAt *time.Time, readingTime *int) error
	Delete(ctx context.Context, id int64) error

	ListRevisions(ctx context.Context, postID int64) ([]domain.PostRevision, error)
	RestoreRevision(ctx context.Context, postID, revisionID int64, editorID *int64) error

	PostStatusID(ctx context.Context, code string) (int64, error)
	PostTypeID(ctx context.Context, code string) (int64, error)
	PostFormatID(ctx context.Context, code string) (int64, error)
	SnapshotRevision(ctx context.Context, postID int64, editorID *int64, note *string) error
}
