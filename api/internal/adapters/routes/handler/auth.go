package handler

import (
	"errors"
	"strconv"
    "apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/services"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	svc input.AuthService
}

func NewAuthHandler(svc input.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	if req.Email == "" || req.Password == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "email and password are required")
	}

	pair, err := h.svc.Login(c.Context(), req.Email, req.Password, c.IP())
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidCredentials):
			return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		case errors.Is(err, services.ErrTooManyAttempts):
			return ResError(c, fiber.StatusTooManyRequests, "TOO_MANY_REQUESTS", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, pair, nil, nil)
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req domain.RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	if req.RefreshToken == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "refresh_token is required")
	}

	pair, err := h.svc.Refresh(c.Context(), req.RefreshToken)
	if err != nil {
		if errors.Is(err, services.ErrInvalidToken) {
			return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		}
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, pair, nil, nil)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req domain.RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	if req.RefreshToken == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "refresh_token is required")
	}

	if err := h.svc.Logout(c.Context(), req.RefreshToken); err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req domain.ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	if req.Email == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "email is required")
	}

	if err := h.svc.ForgotPassword(c.Context(), req.Email); err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	// Generic response — does not reveal whether the email exists.
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "if the email exists, a reset link has been sent"}, nil, nil)
}

func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req domain.ResetPasswordRequest
	
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	if req.Token == "" || req.NewPassword == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "token and new_password are required")
	}

	if err := h.svc.ResetPassword(c.Context(), req.Token, req.NewPassword, c.IP()); err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidToken):
			return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
		case errors.Is(err, services.ErrWeakPassword):
			return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "password has been reset"}, nil, nil)
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("userID").(string)
	if userIDStr == "" {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "missing authentication")
	}
	uid, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "invalid user identity")
	}

	me, err := h.svc.Me(c.Context(), uid)
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	if me == nil {
		return ResError(c, fiber.StatusNotFound, "NOT_FOUND", "user not found")
	}
	return ResOk(c, fiber.StatusOK, me, nil, nil)
}
