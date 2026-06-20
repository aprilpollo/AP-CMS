package handler

import (
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type CategoriesHandler struct {
	svc input.CategoriesService
}

func NewCategoriesHandler(svc input.CategoriesService) *CategoriesHandler {
	return &CategoriesHandler{svc: svc}
}

func (h *CategoriesHandler) Gets(c *fiber.Ctx) error {
	opts, err := query.Parse("categories", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	categories, total, err := h.svc.Gets(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, categories, &total, &opts)
}

func (h *CategoriesHandler) Create(c *fiber.Ctx) error {
	var input domain.CreateCategoriesInput
	if err := c.BodyParser(&input); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	category, err := h.svc.Create(c.Context(), &input)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusCreated, category, nil, nil)
}

func (h *CategoriesHandler) SlugExists(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "slug is required")
	}

	exists, err := h.svc.SlugExists(c.Context(), slug)
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", err.Error())
	}

	return ResOk(c, fiber.StatusOK, map[string]bool{"exists": exists}, nil, nil)
}