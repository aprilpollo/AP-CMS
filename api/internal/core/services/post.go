package services

import (
	"context"
	"errors"
	"strconv"
	"time"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"apcms/internal/pkg/slug"
	"strings"
	"github.com/google/uuid"
)

var (
	ErrPostNotFound  = errors.New("post not found")
	ErrPostForbidden = errors.New("you are not allowed to modify this post")
	ErrInvalidStatus = errors.New("invalid status (expected draft, published, or archived)")
)

const wordsPerMinute = 200

type postService struct {
	posts output.PostRepository
	tags  output.TagRepository
}

func NewPostService(posts output.PostRepository, tags output.TagRepository) input.PostService {
	return &postService{posts: posts, tags: tags}
}

func (s *postService) Gets(ctx context.Context, opts query.QueryOptions) ([]domain.Post, int64, error) {
	return s.posts.FindAll(ctx, opts)
}

func (s *postService) GetBySlug(ctx context.Context, slug string) (*domain.Post, error) {
	post, err := s.posts.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, ErrPostNotFound
	}
	return post, nil
}

func (s *postService) Create(ctx context.Context, in *domain.CreatePostInput) (*domain.Post, error) {
	formatCode := derefOr(in.ContentFormat, "markdown")
	typeCode := derefOr(in.Type, "post")

	formatID, err := s.posts.PostFormatID(ctx, formatCode)
	if err != nil {
		return nil, err
	}
	typeID, err := s.posts.PostTypeID(ctx, typeCode)
	if err != nil {
		return nil, err
	}
	statusID, err := s.posts.PostStatusID(ctx, "draft")
	if err != nil {
		return nil, err
	}

	finalSlug, err := s.uniqueSlug(ctx, derefOr(in.Slug, in.Title), in.Title, "")
	if err != nil {
		return nil, err
	}

	var tagIDs []int64
	if len(in.Tags) > 0 {
		tagIDs, err = s.tags.FindOrCreate(ctx, in.Tags)
		if err != nil {
			return nil, err
		}
	}

	id, err := s.posts.Create(ctx, &domain.PostWrite{
		AuthorID:         &in.AuthorID,
		CategoryIDs:      in.CategoryIDs,
		Title:            in.Title,
		Slug:             finalSlug,
		Content:          in.Content,
		ContentFormatID:  formatID,
		Excerpt:          in.Excerpt,
		StatusID:         statusID,
		PostTypeID:       typeID,
		FeaturedImageURL: in.FeaturedImageURL,
		TagIDs:           tagIDs,
	})
	if err != nil {
		return nil, err
	}
	return s.posts.FindByID(ctx, id)
}

func (s *postService) Update(ctx context.Context, id int64, actor *domain.Actor, in *domain.UpdatePostInput) (*domain.Post, error) {
	_, err := s.requireEditable(ctx, id, actor, actor.CanEditAny)
	if err != nil {
		return nil, err
	}

	if err := s.posts.SnapshotRevision(ctx, id, &actor.UserID, nil); err != nil {
		return nil, err
	}

	upd := domain.PostUpdate{
		Title:            in.Title,
		Content:          in.Content,
		Excerpt:          in.Excerpt,
		CategoryIDs:      in.CategoryIDs,
		FeaturedImageURL: in.FeaturedImageURL,
	}

	if in.ContentFormat != nil {
		fid, err := s.posts.PostFormatID(ctx, *in.ContentFormat)
		if err != nil {
			return nil, err
		}
		upd.ContentFormatID = &fid
	}

	if in.Tags != nil {
		ids, err := s.tags.FindOrCreate(ctx, *in.Tags)
		if err != nil {
			return nil, err
		}
		upd.TagIDs = &ids
	}

	if err := s.posts.Update(ctx, id, &upd); err != nil {
		return nil, err
	}

	return s.posts.FindByID(ctx, id)
}

func (s *postService) ChangeStatus(ctx context.Context, id int64, actor *domain.Actor, status string) (*domain.Post, error) {
	if status != "draft" && status != "published" && status != "archived" {
		return nil, ErrInvalidStatus
	}

	post, err := s.requireEditable(ctx, id, actor, actor.CanEditAny)
	if err != nil {
		return nil, err
	}

	statusID, err := s.posts.PostStatusID(ctx, status)
	if err != nil {
		return nil, err
	}

	var publishedAt *time.Time
	var readingTime *int
	if status == "published" {
		if post.PublishedAt != nil {
			publishedAt = post.PublishedAt
		} else {
			now := time.Now()
			publishedAt = &now
		}
		rt := readingTimeMinutes(post.Content)
		readingTime = &rt
	}

	if err := s.posts.UpdateStatus(ctx, id, statusID, publishedAt, readingTime); err != nil {
		return nil, err
	}
	return s.posts.FindByID(ctx, id)
}

func (s *postService) ListRevisions(ctx context.Context, postID int64) ([]domain.PostRevision, error) {
	return s.posts.ListRevisions(ctx, postID)
}

func (s *postService) RestoreRevision(ctx context.Context, postID, revisionID int64, actor *domain.Actor) (*domain.Post, error) {
	if _, err := s.requireEditable(ctx, postID, actor, actor.CanEditAny); err != nil {
		return nil, err
	}
	if err := s.posts.RestoreRevision(ctx, postID, revisionID, &actor.UserID); err != nil {
		return nil, err
	}
	return s.posts.FindByID(ctx, postID)
}

func (s *postService) Delete(ctx context.Context, id int64, actor *domain.Actor) error {
	if _, err := s.requireEditable(ctx, id, actor, actor.CanDeleteAny); err != nil {
		return err
	}
	return s.posts.Delete(ctx, id)
}

func (s *postService) uniqueSlug(ctx context.Context, base, title, excludeID string) (string, error) {
	candidate := slug.Make(base)
	if candidate == "" {
		candidate = slug.Make(title)
	}
	if candidate == "" {
		candidate = "post-" + uuid.NewString()[:8]
	}

	root := candidate
	for i := 2; ; i++ {
		exists, err := s.posts.SlugExists(ctx, candidate, excludeID)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = root + "-" + strconv.Itoa(i)
	}
}

func (s *postService) requireEditable(ctx context.Context, id int64, actor *domain.Actor, canAny bool) (*domain.Post, error) {
	post, err := s.posts.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, ErrPostNotFound
	}
	owns := post.AuthorID != nil && *post.AuthorID == actor.UserID
	if !owns && !canAny {
		return nil, ErrPostForbidden
	}
	return post, nil
}

func derefOr(p *string, def string) string {
	if p != nil && *p != "" {
		return *p
	}
	return def
}

func readingTimeMinutes(content *string) int {
	if content == nil {
		return 1
	}
	words := len(strings.Fields(*content))
	minutes := words / wordsPerMinute
	if words%wordsPerMinute != 0 {
		minutes++
	}
	if minutes < 1 {
		minutes = 1
	}
	return minutes
}