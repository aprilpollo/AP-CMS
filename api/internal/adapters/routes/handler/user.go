package handler

import (
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	svc input.UserService
}

func NewUserHandler(svc input.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func (h *UserHandler) Gets(c *fiber.Ctx) error {
	opts, err := query.Parse("users", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	users, total, err := h.svc.List(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, users, &total, &opts)
}

func (h *UserHandler) GetByID(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	user, err := h.svc.GetByID(c.Context(), int64(userId))
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	if user == nil {
		return ResError(c, fiber.StatusNotFound, "NOT_FOUND", "user not found")
	}
	return ResOk(c, fiber.StatusOK, user, nil, nil)
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req domain.UserCreate
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	err := h.svc.Create(c.Context(), &req)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusCreated, fiber.Map{"message": "user created"}, nil, nil)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	var req domain.UserUpdate
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	err = h.svc.Update(c.Context(), int64(userId), &req)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "user updated"}, nil, nil)
}
