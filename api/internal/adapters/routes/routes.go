package routes

import (
	"apcms/internal/adapters/routes/handler"
	"apcms/internal/adapters/routes/middleware"
	"apcms/internal/core/ports/output"

	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App, h *handler.AuthHandler, jwtMw fiber.Handler) {
	auth := app.Group("/api/v1/auth")

	{
		auth.Get("/me", jwtMw, h.Me)
	}
	{
		auth.Post("/login", h.Login)
		auth.Post("/refresh", h.Refresh)
		auth.Post("/logout", h.Logout)
		auth.Post("/forgot-password", h.ForgotPassword)
		auth.Post("/reset-password", h.ResetPassword)
	}

}

func RegisterUsersRoutes(app *fiber.App, h *handler.UserHandler, jwtMw fiber.Handler, authz output.AuthzRepository) {
	users := app.Group("/api/v1/users", jwtMw)

	{
		users.Get("/", middleware.RequirePermission(authz, "users.manage"), h.Gets)
		// users.Get("/:id", h.GetByID)
	}

	{
		// users.Post("/", middleware.RequirePermission(authz, "users.manage"), h.Create)
	}
}
