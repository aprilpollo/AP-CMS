package repository

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/adapters/storage/orm/views"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"apcms/internal/utils"

	"gorm.io/gorm"
)

type postRepository struct {
	db *gorm.DB
}

var postPreloads = []string{"Status", "PostType", "ContentFormat", "Author"}

func NewPostRepository(db *gorm.DB) output.PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Post, int64, error) {
	var rows []views.VWPost
	var total int64

	countTotal := query.ApplyToGorm(r.db.WithContext(ctx).Model(&views.VWPost{}), query.QueryOptions{Filters: opts.Filters})
	if err := countTotal.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&views.VWPost{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	posts := make([]domain.Post, len(rows))
	for i, row := range rows {
		posts[i] = *row.ToDomain()
	}

	return posts, total, nil
}

func (r *postRepository) FindByID(ctx context.Context, id int64) (*domain.Post, error) {
	return r.findOne(ctx, "id = ?", id)
}

func (r *postRepository) FindBySlug(ctx context.Context, slug string) (*domain.Post, error) {
	return r.findOne(ctx, "slug = ?", slug)
}

func (r *postRepository) SlugExists(ctx context.Context, slug, excludeID string) (bool, error) {
	q := r.db.WithContext(ctx).Model(&models.PostModel{}).Where("slug = ?", slug)
	if excludeID != "" {
		if pid, err := strconv.ParseUint(excludeID, 10, 64); err == nil {
			q = q.Where("id <> ?", int64(pid))
		}
	}
	var count int64
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *postRepository) Create(ctx context.Context, post *domain.PostWrite) (int64, error) {
	m := models.PostModel{
		AuthorID:         post.AuthorID,
		Title:            post.Title,
		Slug:             post.Slug,
		Content:          post.Content,
		ContentFormatID:  post.ContentFormatID,
		Excerpt:          post.Excerpt,
		StatusID:         post.StatusID,
		PostTypeID:       post.PostTypeID,
		FeaturedImageURL: post.FeaturedImageURL,
	}
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit(postPreloads...).Create(&m).Error; err != nil {
			return err
		}
		if err := insertPostTags(tx, m.ID, post.TagIDs); err != nil {
			return err
		}
		return insertPostCategories(tx, m.ID, post.CategoryIDs)
	})
	return m.ID, err
}

func (r *postRepository) Update(ctx context.Context, id int64, post *domain.PostUpdate) error {
	fields := utils.StructToMap(post)

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if len(fields) > 0 {
			fields["updated_at"] = time.Now()
			if err := tx.Model(&models.PostModel{}).Where("id = ?", id).Updates(fields).Error; err != nil {
				return err
			}
		}
		if post.TagIDs != nil {
			if err := tx.Where("post_id = ?", id).Delete(&models.PostTagModel{}).Error; err != nil {
				return err
			}
			if err := insertPostTags(tx, id, *post.TagIDs); err != nil {
				return err
			}
		}
		if post.CategoryIDs != nil {
			if err := tx.Where("post_id = ?", id).Delete(&models.PostCategoriesModel{}).Error; err != nil {
				return err
			}
			if err := insertPostCategories(tx, id, *post.CategoryIDs); err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *postRepository) UpdateStatus(ctx context.Context, id int64, statusID int64, publishedAt *time.Time, readingTime *int) error {
	fields := map[string]any{"status_id": statusID, "updated_at": time.Now()}
	if publishedAt != nil {
		fields["published_at"] = *publishedAt
	}
	if readingTime != nil {
		fields["reading_time_min"] = *readingTime
	}
	return r.db.WithContext(ctx).Model(&models.PostModel{}).Where("id = ?", id).Updates(fields).Error
}

func (r *postRepository) ListRevisions(ctx context.Context, postID int64) ([]domain.PostRevision, error) {

	var rows []views.VWPostRevision
	err := r.db.WithContext(ctx).
		Where("post_id = ?", postID).
		Order("id DESC").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]domain.PostRevision, len(rows))
	for i, rw := range rows {
		out[i] = domain.PostRevision{
			ID: rw.ID, PostID: rw.PostID, EditorID: rw.EditorID,
			Content: rw.Content, ContentFormat: rw.ContentFormat,
			RevisionNote: rw.RevisionNote, CreatedAt: rw.CreatedAt,
		}
	}
	return out, nil
}

func (r *postRepository) RestoreRevision(ctx context.Context, postID, revisionID int64, editorID *int64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var rev models.PostRevisionModel
		if err := tx.Where("id = ? AND post_id = ?", revisionID, postID).First(&rev).Error; err != nil {
			return err
		}
		// snapshot current content before overwriting
		if err := snapshotRevision(tx, postID, editorID, strptr("restore")); err != nil {
			return err
		}
		return tx.Model(&models.PostModel{}).Where("id = ?", postID).Updates(map[string]any{
			"content":           rev.Content,
			"content_blocks":    rev.ContentBlocks,
			"content_format_id": rev.ContentFormatID,
			"updated_at":        time.Now(),
		}).Error
	})
}

func (r *postRepository) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&models.PostModel{}).Error
}

func (r *postRepository) PostStatusID(ctx context.Context, code string) (int64, error) {
	return r.idByCode(ctx, "post_statuses", code)
}

func (r *postRepository) PostTypeID(ctx context.Context, code string) (int64, error) {
	return r.idByCode(ctx, "post_types", code)
}

func (r *postRepository) PostFormatID(ctx context.Context, code string) (int64, error) {
	return r.idByCode(ctx, "content_formats", code)
}

func (r *postRepository) SnapshotRevision(ctx context.Context, postID int64, editorID *int64, note *string) error {
	return snapshotRevision(r.db.WithContext(ctx), postID, editorID, note)
}

func (r *postRepository) findOne(ctx context.Context, cond string, arg any) (*domain.Post, error) {
	var row views.VWPost
	if err := r.db.WithContext(ctx).Where(cond, arg).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return row.ToDomain(), nil
}

func (r *postRepository) idByCode(ctx context.Context, table, code string) (int64, error) {
	var id int64
	if err := r.db.WithContext(ctx).Table(table).Where("code = ?", code).Pluck("id", &id).Error; err != nil {
		return 0, err
	}
	if id == 0 {
		return 0, fmt.Errorf("unknown %s code: %q", table, code)
	}
	return id, nil
}

func insertPostTags(tx *gorm.DB, postID int64, tagIDs []int64) error {
	if len(tagIDs) == 0 {
		return nil
	}
	links := make([]models.PostTagModel, len(tagIDs))
	for i, tid := range tagIDs {
		links[i] = models.PostTagModel{PostID: postID, TagID: tid}
	}
	return tx.Omit("Post", "Tag").Create(&links).Error
}

func insertPostCategories(tx *gorm.DB, postID int64, categoryIDs []int64) error {
	if len(categoryIDs) == 0 {
		return nil
	}
	links := make([]models.PostCategoriesModel, len(categoryIDs))
	for i, cid := range categoryIDs {
		links[i] = models.PostCategoriesModel{PostID: postID, CategoryID: cid}
	}
	return tx.Omit("Post", "Category").Create(&links).Error
}

func snapshotRevision(tx *gorm.DB, postID int64, editorID *int64, note *string) error {
	const sql = `INSERT INTO post_revisions (post_id, editor_id, content, content_blocks, content_format_id, revision_note, created_at)
SELECT id, ?, content, content_blocks, content_format_id, ?, now() FROM posts WHERE id = ?`
	return tx.Exec(sql, editorID, note, postID).Error
}

func strptr(s string) *string { return &s }
