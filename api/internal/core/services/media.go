package services

import (
	"context"
	"errors"
	"path"
	"strings"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"

	"github.com/google/uuid"
)

var (
	ErrInvalidMimeType    = errors.New("unsupported mime type")
	ErrFileTooLarge       = errors.New("file exceeds the maximum allowed size")
	ErrStorageUnavailable = errors.New("file storage is not configured")
)

const maxUploadBytes = 10 << 20 // 10 MiB

var allowedMimeTypes = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/gif":       true,
	"image/webp":      true,
	"image/svg+xml":   true,
	"application/pdf": true,
	"video/mp4":       true,
}

type mediaService struct {
	repo    output.MediaRepository
	storage output.FileStorage
}

func NewMediaService(repo output.MediaRepository, storage output.FileStorage) input.MediaService {
	return &mediaService{repo: repo, storage: storage}
}

func (s *mediaService) List(ctx context.Context, opts query.QueryOptions) ([]domain.Media, int64, error) {
	medias, total, err := s.repo.FindAll(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	return medias, total, nil
}

func (s *mediaService) Upload(ctx context.Context, in *domain.UploadMediaInput) (*domain.Media, error) {
	if s.storage == nil {
		return nil, ErrStorageUnavailable
	}
	if !allowedMimeTypes[in.MimeType] {
		return nil, ErrInvalidMimeType
	}
	if in.SizeBytes > maxUploadBytes {
		return nil, ErrFileTooLarge
	}

	key := "uploads/" + uuid.NewString() + strings.ToLower(path.Ext(in.Filename))

	url, err := s.storage.Upload(ctx, key, in.Data, int64(in.SizeBytes), in.MimeType)
	if err != nil {
		return nil, err
	}

	id, err := s.repo.Create(ctx, &domain.MediaWrite{
		UploaderID:      in.UploaderID,
		Filename:        key,
		OriginalName:    in.Filename,
		MimeType:        in.MimeType,
		URL:             url,
		StorageProvider: "s3",
		SizeBytes:       in.SizeBytes,
		Width:           in.Width,
		Height:          in.Height,
		AltText:         in.AltText,
	})
	if err != nil {
		return nil, err
	}
	return s.repo.FindByID(ctx, id)
}
