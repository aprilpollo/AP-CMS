package handler

import (
	"bytes"
	"errors"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"strconv"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/services"

	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type MediaHandler struct {
	svc input.MediaService
}

func NewMediaHandler(svc input.MediaService) *MediaHandler {
	return &MediaHandler{svc: svc}
}

func (h *MediaHandler) Gets(c *fiber.Ctx) error {
	opts, err := query.Parse("media", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	media, total, err := h.svc.List(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, media, &total, &opts)
}

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	var uploader *int64
	if uid, err := strconv.ParseUint(c.Locals("userID").(string), 10, 64); err == nil {
		id := int64(uid)
		uploader = &id
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "multipart file field \"file\" is required")
	}
	f, err := fileHeader.Open()
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	mimeType := fileHeader.Header.Get("Content-Type")

	var altText *string
	if v := c.FormValue("alt_text"); v != "" {
		altText = &v
	}

	// Best-effort image dimensions (png/jpeg/gif).
	var width, height *int
	if cfg, _, derr := image.DecodeConfig(bytes.NewReader(data)); derr == nil {
		w, h := cfg.Width, cfg.Height
		width, height = &w, &h
	}

	media, err := h.svc.Upload(c.Context(), &domain.UploadMediaInput{
		UploaderID: uploader,
		Filename:   fileHeader.Filename,
		MimeType:   mimeType,
		SizeBytes:  len(data),
		Data:       bytes.NewReader(data),
		Width:      width,
		Height:     height,
		AltText:    altText,
	})

	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidMimeType):
			return ResError(c, fiber.StatusUnsupportedMediaType, "UNSUPPORTED_MEDIA_TYPE", err.Error())
		case errors.Is(err, services.ErrFileTooLarge):
			return ResError(c, fiber.StatusRequestEntityTooLarge, "PAYLOAD_TOO_LARGE", err.Error())
		case errors.Is(err, services.ErrStorageUnavailable):
			return ResError(c, fiber.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusCreated, media, nil, nil)
}
