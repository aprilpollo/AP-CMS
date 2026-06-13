package middleware

import (
	"strconv"

	"apcms/internal/core/ports/output"

	"github.com/gofiber/fiber/v2"
)

// RequirePermission ensures the authenticated user holds the given permission slug.
// Must run after JWT (it reads c.Locals("userID")).
func RequirePermission(repo output.AuthzRepository, slug string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userIDStr, _ := c.Locals("userID").(string)
		if userIDStr == "" {
			return unauthorized(c, "missing authentication")
		}
		uid, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			return unauthorized(c, "invalid user identity")
		}

		perms, err := repo.PermissionsByUserID(c.Context(), uid)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"code": fiber.StatusInternalServerError, "message": "INTERNAL_ERROR",
				"error": err.Error(), "payload": nil,
			})
		}

		for _, p := range perms {
			if p == slug {
				return c.Next()
			}
		}
		return forbidden(c, "missing permission: "+slug)
	}
}

// RequireSelfOrPermission allows the request when the authenticated user is
// acting on their own resource (c.Params(idParam) == userID) or holds the given
// permission slug. Must run after JWT.
func RequireSelfOrPermission(repo output.AuthzRepository, idParam, slug string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userIDStr, _ := c.Locals("userID").(string)
		if userIDStr == "" {
			return unauthorized(c, "missing authentication")
		}
		if c.Params(idParam) == userIDStr {
			return c.Next()
		}
		uid, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			return unauthorized(c, "invalid user identity")
		}

		perms, err := repo.PermissionsByUserID(c.Context(), uid)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"code": fiber.StatusInternalServerError, "message": "INTERNAL_ERROR",
				"error": err.Error(), "payload": nil,
			})
		}
		for _, p := range perms {
			if p == slug {
				return c.Next()
			}
		}
		return forbidden(c, "you can only modify your own profile")
	}
}

func forbidden(c *fiber.Ctx, msg string) error {
	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"code": fiber.StatusForbidden, "message": "FORBIDDEN",
		"error": msg, "payload": nil,
	})
}
