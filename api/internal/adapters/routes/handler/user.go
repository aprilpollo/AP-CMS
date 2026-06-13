package handler

import (
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

// func (h *UserHandler) GetByID(c *fiber.Ctx) error {
// 	user, err := h.svc.GetByID(c.Context(), c.Params("id"))
// 	if err != nil {
// 		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
// 	}
// 	if user == nil {
// 		return ResError(c, fiber.StatusNotFound, "NOT_FOUND", "user not found")
// 	}
// 	return ResOk(c, fiber.StatusOK, user, nil, nil)
// }

// func (h *UserHandler) Create(c *fiber.Ctx) error {
// 	var req domain.CreateUserInput
// 	if err := c.BodyParser(&req); err != nil {
// 		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
// 	}

// 	user, err := h.svc.Create(c.Context(), &req)
// 	if err != nil {
// 		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
// 	}
// 	return ResOk(c, fiber.StatusCreated, user, nil, nil)
// }
