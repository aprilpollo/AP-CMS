package middleware

import (
	"strings"

	"apcms/internal/pkg/jwt"

	"github.com/gofiber/fiber/v2"
)

// JWT verifies the Bearer access token and stores the user id in c.Locals("userID").
func JWT(m *jwt.Manager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			return unauthorized(c, "missing or malformed Authorization header")
		}

		claims, err := m.Parse(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			return unauthorized(c, "invalid or expired token")
		}

		c.Locals("userID", claims.UserID)
		return c.Next()
	}
}

// OptionalJWT sets c.Locals("userID") when a valid Bearer token is present, but
// never rejects the request. Used for endpoints that are public yet behave
// differently for authenticated viewers.
func OptionalJWT(m *jwt.Manager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if strings.HasPrefix(header, "Bearer ") {
			if claims, err := m.Parse(strings.TrimPrefix(header, "Bearer ")); err == nil {
				c.Locals("userID", claims.UserID)
			}
		}
		return c.Next()
	}
}

func unauthorized(c *fiber.Ctx, msg string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"code":    fiber.StatusUnauthorized,
		"message": "UNAUTHORIZED",
		"error":   msg,
		"payload": nil,
	})
}
