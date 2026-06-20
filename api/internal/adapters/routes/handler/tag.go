package handler

import (
	// "apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type TagHandler struct {
	svc input.TagService
}

func NewTagHandler(svc input.TagService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) Gets(c *fiber.Ctx) error {
	opts, err := query.Parse("tags", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	tags, total, err := h.svc.Gets(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, tags, &total, &opts)
}
