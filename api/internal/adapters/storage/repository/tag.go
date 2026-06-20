package repository

import (
	"context"
	"errors"
	"strings"

	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"apcms/internal/pkg/slug"

	"gorm.io/gorm"
)

type tagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) output.TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Tag, int64, error) {
	var rows []models.TagModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.TagModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.TagModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	tags := make([]domain.Tag, len(rows))
	for i, row := range rows {
		tags[i] = *row.ToDomain()
	}

	return tags, total, nil
}

func (r *tagRepository) FindOrCreate(ctx context.Context, names []string) ([]int64, error) {
	ids := make([]int64, 0, len(names))
	for _, name := range names {
		name = strings.TrimSpace(name)
		if name == "" {
			continue
		}
		s := slug.Make(name)
		if s == "" {
			s = strings.ToLower(name)
		}

		var m models.TagModel
		err := r.db.WithContext(ctx).Where("slug = ?", s).First(&m).Error
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			m = models.TagModel{Name: name, Slug: s}
			if err := r.db.WithContext(ctx).Create(&m).Error; err != nil {
				return nil, err
			}
		case err != nil:
			return nil, err
		}
		ids = append(ids, m.ID)
	}
	return ids, nil
}
