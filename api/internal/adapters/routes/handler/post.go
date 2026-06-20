package handler

import (
	"errors"
	"strconv"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/core/services"
	"apcms/internal/pkg/query"

	"github.com/gofiber/fiber/v2"
)

type PostHandler struct {
	svc   input.PostService
	authz output.AuthzRepository
}

func NewPostHandler(svc input.PostService, authz output.AuthzRepository) *PostHandler {
	return &PostHandler{svc: svc, authz: authz}
}

func (h *PostHandler) Gets(c *fiber.Ctx) error {
	opts, err := query.Parse("vw_post", c.Queries())
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	if _, canSeeAll := h.viewer(c); !canSeeAll {
		opts.Filters = append(opts.Filters, query.Filter{
			Field:    "status",
			Operator: "=",
			Value:    "published",
		})

	}

	posts, total, err := h.svc.Gets(c.Context(), opts)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusOK, posts, &total, &opts)
}

func (h *PostHandler) GetBySlug(c *fiber.Ctx) error {
	post, err := h.svc.GetBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	if post == nil {
		return ResError(c, fiber.StatusNotFound, "NOT_FOUND", "post not found")
	}

	if post.Status != "published" {
		viewerID, canSeeAll := h.viewer(c)
		owns := viewerID != nil && post.AuthorID != nil && *post.AuthorID == *viewerID
		if !owns && !canSeeAll {
			return ResError(c, fiber.StatusNotFound, "NOT_FOUND", "post not found")
		}
	}
	return ResOk(c, fiber.StatusOK, post, nil, nil)
}

func (h *PostHandler) Create(c *fiber.Ctx) error {
	actor, err := h.actor(c)
	if err != nil {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
	}

	var req domain.CreatePostInput
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	if req.Title == "" {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "title is required")
	}

	req.AuthorID = actor.UserID

	post, err := h.svc.Create(c.Context(), &req)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}
	return ResOk(c, fiber.StatusCreated, post, nil, nil)

}

func (h *PostHandler) Update(c *fiber.Ctx) error {
	actor, err := h.actor(c)
	if err != nil {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
	}

	postID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid post id")
	}

	var req domain.UpdatePostInput
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	post, err := h.svc.Update(c.Context(), postID, &actor, &req)
	if err != nil {
		return mapPostError(c, err)
	}
	return ResOk(c, fiber.StatusOK, post, nil, nil)
}

func (h *PostHandler) ChangeStatus(c *fiber.Ctx) error {
	actor, err := h.actor(c)
	if err != nil {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
	}

	var req domain.ChangePostStatusInput
	if err := c.BodyParser(&req); err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	}

	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid post id")
	}

	post, err := h.svc.ChangeStatus(c.Context(), id, &actor, req.Status)
	if err != nil {
		return mapPostError(c, err)
	}
	return ResOk(c, fiber.StatusOK, post, nil, nil)
}

// GET /api/v1/posts/:id/revisions
func (h *PostHandler) ListRevisions(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid post id")
	}
	revs, err := h.svc.ListRevisions(c.Context(), id)
	if err != nil {
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return ResOk(c, fiber.StatusOK, revs, nil, nil)
}

// POST /api/v1/posts/:id/revisions/:rid/restore
func (h *PostHandler) RestoreRevision(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid post id")
	}
	rid, err := strconv.ParseInt(c.Params("rid"), 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid revision id")
	}
	actor, err := h.actor(c)
	if err != nil {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
	}
	post, err := h.svc.RestoreRevision(c.Context(), id, rid, &actor)
	if err != nil {
		return mapPostError(c, err)
	}
	return ResOk(c, fiber.StatusOK, post, nil, nil)
}

func (h *PostHandler) Delete(c *fiber.Ctx) error {
	actor, err := h.actor(c)
	if err != nil {
		return ResError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error())
	}
	postID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", "invalid post id")
	}

	err = h.svc.Delete(c.Context(), postID, &actor)
	if err != nil {
		return mapPostError(c, err)
	}
	return ResOk(c, fiber.StatusOK, fiber.Map{"message": "post deleted"}, nil, nil)
}

func (h *PostHandler) actor(c *fiber.Ctx) (domain.Actor, error) {
	userID, _ := c.Locals("userID").(string)
	uid, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return domain.Actor{}, errors.New("missing authentication")
	}

	perms, err := h.authz.PermissionsByUserID(c.Context(), uid)
	if err != nil {
		return domain.Actor{}, err
	}
	return domain.Actor{
		UserID:       int64(uid),
		CanEditAny:   contains(perms, "posts.edit_any"),
		CanDeleteAny: contains(perms, "posts.delete_any"),
	}, nil
}

func (h *PostHandler) viewer(c *fiber.Ctx) (*int64, bool) {
	userID, _ := c.Locals("userID").(string)
	uid, err := strconv.ParseUint(userID, 10, 64)
	if err != nil {
		return nil, false
	}
	id := int64(uid)
	perms, err := h.authz.PermissionsByUserID(c.Context(), id)
	if err != nil {
		return &id, false
	}
	return &id, contains(perms, "posts.edit_any")
}

func contains(ss []string, target string) bool {
	for _, s := range ss {
		if s == target {
			return true
		}
	}
	return false
}

func mapPostError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, services.ErrPostNotFound):
		return ResError(c, fiber.StatusNotFound, "NOT_FOUND", err.Error())
	case errors.Is(err, services.ErrPostForbidden):
		return ResError(c, fiber.StatusForbidden, "FORBIDDEN", err.Error())
	case errors.Is(err, services.ErrInvalidStatus):
		return ResError(c, fiber.StatusBadRequest, "BAD_REQUEST", err.Error())
	default:
		return ResError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
}
