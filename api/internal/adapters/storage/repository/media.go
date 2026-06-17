package repository

import (
	"context"
	"errors"
	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"

	"gorm.io/gorm"
)

type mediaRepository struct {
	db *gorm.DB
}

func NewMediaRepository(db *gorm.DB) output.MediaRepository {
	return &mediaRepository{db: db}
}

func (r *mediaRepository) FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.Media, int64, error) {
	var rows []models.MediaModel
	var total int64

	count := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.MediaModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := count.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.MediaModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	medias := make([]domain.Media, len(rows))
	for i, row := range rows {
		medias[i] = *row.ToDomain()
	}

	return medias, total, nil
}

func (r *mediaRepository) FindByID(ctx context.Context, id int64) (*domain.Media, error) {
	var row models.MediaModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return row.ToDomain(), nil
}

func (r *mediaRepository) Create(ctx context.Context, w *domain.MediaWrite) (int64, error) {
	m := models.MediaModel{
		UploaderID:      w.UploaderID,
		Filename:        w.Filename,
		OriginalName:    w.OriginalName,
		MimeType:        w.MimeType,
		URL:             w.URL,
		StorageProvider: w.StorageProvider,
		SizeBytes:       w.SizeBytes,
		Width:           w.Width,
		Height:          w.Height,
		AltText:         w.AltText,
	}
	err := r.db.WithContext(ctx).Omit("Uploader").Create(&m).Error
	return m.ID, err
}
