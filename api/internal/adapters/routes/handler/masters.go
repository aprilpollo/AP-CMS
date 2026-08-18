package handler

import (
	"apcms/internal/core/ports/input"
	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type MasterHandler struct {
	svc input.MasterService
}

func NewMasterHandler(svc input.MasterService) *MasterHandler {
	return &MasterHandler{svc: svc}
}

func (h *MasterHandler) GetsRoles(c *fiber.Ctx) error {
	opts, err := query.Parse("roles", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	roles, total, err := h.svc.GetsRoles(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, roles, &total, &opts)
}

func (h *MasterHandler) GetsPostStatuses(c *fiber.Ctx) error {
	opts, err := query.Parse("post_statuses", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	statuses, total, err := h.svc.GetsPostStatuses(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, statuses, &total, &opts)
}

func (h *MasterHandler) GetsPostTypes(c *fiber.Ctx) error {
	opts, err := query.Parse("post_types", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	types, total, err := h.svc.GetsPostTypes(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, types, &total, &opts)
}

func (h *MasterHandler) GetsContentFormats(c *fiber.Ctx) error {
	opts, err := query.Parse("content_formats", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	formats, total, err := h.svc.GetsContentFormats(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, formats, &total, &opts)
}

func (h *MasterHandler) GetsCommentStatuses(c *fiber.Ctx) error {
	opts, err := query.Parse("comment_statuses", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	statuses, total, err := h.svc.GetsCommentStatuses(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, statuses, &total, &opts)
}

func (h *MasterHandler) GetsSettingTypes(c *fiber.Ctx) error {
	opts, err := query.Parse("setting_types", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	types, total, err := h.svc.GetsSettingTypes(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, types, &total, &opts)
}

func (h *MasterHandler) GetsAuditActions(c *fiber.Ctx) error {
	opts, err := query.Parse("audit_actions", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	actions, total, err := h.svc.GetsAuditActions(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, actions, &total, &opts)
}