package handler

import (
	"errors"
	"strconv"
	"strings"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/services"
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

	user, err := h.svc.Create(c.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEmailTaken):
			return ResError(c, fiber.StatusConflict, "CONFLICT", err.Error())
		case errors.Is(err, services.ErrWeakPassword):
			return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
		default:
			return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
		}
	}
	return ResOk(c, fiber.StatusCreated, user, nil, nil)
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
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		case errors.Is(err, services.ErrEmailTaken):
			return ResError(c, fiber.StatusConflict, "CONFLICT", err.Error())
		case errors.Is(err, services.ErrLastAdmin):
			return ResError(c, fiber.StatusConflict, "CONFLICT", err.Error())
		default:
			return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "user updated"}, nil, nil)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	// Removing your own account would end the session you are working in.
	if actor, _ := c.Locals("userID").(string); actor == strconv.Itoa(userId) {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "you cannot delete your own account")
	}

	if err := h.svc.Delete(c.Context(), int64(userId)); err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		case errors.Is(err, services.ErrLastAdmin):
			return ResError(c, fiber.StatusConflict, "CONFLICT", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "user deleted"}, nil, nil)
}

func (h *UserHandler) SetPassword(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	var req struct {
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	if req.Password == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "password is required")
	}

	if err := h.svc.SetPassword(c.Context(), int64(userId), req.Password); err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		case errors.Is(err, services.ErrWeakPassword):
			return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "password updated"}, nil, nil)
}

func (h *UserHandler) Sessions(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	sessions, err := h.svc.ListSessions(c.Context(), int64(userId))
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		}
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, sessions, nil, nil)
}

func (h *UserHandler) RevokeSession(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}
	sessionID := c.Params("sid")
	if sessionID == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "session id is required")
	}

	if err := h.svc.RevokeSession(c.Context(), int64(userId), sessionID); err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		}
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "session revoked"}, nil, nil)
}

func (h *UserHandler) Activity(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}
	limit := c.QueryInt("_limit", 20)

	records, err := h.svc.ListActivity(c.Context(), int64(userId), limit)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		}
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, records, nil, nil)
}

func (h *UserHandler) UploadAvatar(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "avatar file is required")
	}
	file, err := fileHeader.Open()
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", "failed to open uploaded file")
	}
	defer file.Close()

	url, err := h.svc.UploadAvatar(c.Context(), int64(userId), domain.UploadAvatar{
		File:        file,
		Size:        fileHeader.Size,
		ContentType: fileHeader.Header.Get("Content-Type"),
	})
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		case errors.Is(err, services.ErrStorageUnavailable):
			return ResError(c, fiber.StatusServiceUnavailable, "UNAVAILABLE", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"avatar_url": url}, nil, nil)
}

func (h *UserHandler) SendInvite(c *fiber.Ctx) error {
	userId, err := c.ParamsInt("id")
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid user id")
	}

	if err := h.svc.SendInvite(c.Context(), int64(userId)); err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
		case errors.Is(err, services.ErrEmailNotSent):
			return ResError(c, fiber.StatusBadGateway, "EMAIL_FAILED", err.Error())
		default:
			return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "invitation sent"}, nil, nil)
}

func (h *UserHandler) EmailAvailable(c *fiber.Ctx) error {
	email := strings.TrimSpace(c.Query("email"))
	if email == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "email is required")
	}

	available, err := h.svc.EmailAvailable(c.Context(), email)
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"email": email, "available": available}, nil, nil)
}
