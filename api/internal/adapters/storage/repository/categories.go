package repository

import (
	"context"
	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"

	"gorm.io/gorm"
)

type categoriesRepository struct {
	db *gorm.DB
}

func NewCategoriesRepository(db *gorm.DB) output.CategoriesRepository {
	return &categoriesRepository{db: db}
}

func (r *categoriesRepository) FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Category, int64, error) {
	var rows []models.CategoriesModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.CategoriesModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.CategoriesModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	categories := make([]domain.Category, len(rows))
	for i, row := range rows {
		categories[i] = *row.ToDomain()
	}

	return categories, total, nil
}

func (r *categoriesRepository) Create(ctx context.Context, in *domain.CreateCategoriesInput) (*domain.Category, error) {
	row := &models.CategoriesModel{
		Name:        in.Name,
		Description: in.Description,
		Slug:        *in.Slug,
		ParentID:    in.ParentID,
	}

	if err := r.db.WithContext(ctx).Create(row).Error; err != nil {
		return nil, err
	}

	return row.ToDomain(), nil
}

func (r *categoriesRepository) SlugExists(ctx context.Context, slug string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.CategoriesModel{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}