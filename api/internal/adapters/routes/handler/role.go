package handler

import (
	"errors"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type RoleHandler struct {
	svc input.RoleService
}

func NewRoleHandler(svc input.RoleService) *RoleHandler {
	return &RoleHandler{svc: svc}
}

func (h *RoleHandler) Gets(c *fiber.Ctx) error {
	opts, err := query.Parse("roles", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	roles, total, err := h.svc.Gets(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, roles, &total, &opts)
}

func (h *RoleHandler) GetsPermissions(c *fiber.Ctx) error {
	opts, err := query.Parse("permissions", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	permissions, total, err := h.svc.GetsPermissions(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, permissions, &total, &opts)
}

func (h *RoleHandler) GetByID(c *fiber.Ctx) error {
	roleID, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid role id")
	}

	role, err := h.svc.GetByID(c.Context(), int64(roleID))
	if err != nil {
		return roleError(c, err)
	}
	return ResOk(c, fiber.StatusOK, role, nil, nil)
}

func (h *RoleHandler) Create(c *fiber.Ctx) error {
	var req domain.CreateRoleInput
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	role, err := h.svc.Create(c.Context(), &req)
	if err != nil {
		return roleError(c, err)
	}
	return ResOk(c, fiber.StatusCreated, role, nil, nil)
}

func (h *RoleHandler) Update(c *fiber.Ctx) error {
	roleID, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid role id")
	}

	var req domain.UpdateRoleInput
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	role, err := h.svc.Update(c.Context(), int64(roleID), &req)
	if err != nil {
		return roleError(c, err)
	}
	return ResOk(c, fiber.StatusOK, role, nil, nil)
}

func (h *RoleHandler) SetPermissions(c *fiber.Ctx) error {
	roleID, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid role id")
	}

	var req domain.SetRolePermissionsInput
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	role, err := h.svc.SetPermissions(c.Context(), int64(roleID), &req)
	if err != nil {
		return roleError(c, err)
	}
	return ResOk(c, fiber.StatusOK, role, nil, nil)
}

func (h *RoleHandler) Delete(c *fiber.Ctx) error {
	roleID, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid role id")
	}

	if err := h.svc.Delete(c.Context(), int64(roleID)); err != nil {
		return roleError(c, err)
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "role deleted"}, nil, nil)
}

// roleError maps role domain errors onto HTTP status codes.
func roleError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, domain.ErrRoleNotFound):
		return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
	case errors.Is(err, domain.ErrRoleSlugExists), errors.Is(err, domain.ErrRoleInUse):
		return ResError(c, fiber.StatusConflict, "CONFLICT", err.Error())
	case errors.Is(err, domain.ErrRoleProtected):
		return ResError(c, fiber.StatusForbidden, "FORBIDDEN", err.Error())
	case errors.Is(err, domain.ErrRoleNameRequired), errors.Is(err, domain.ErrPermissionNotFound):
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	default:
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
}
