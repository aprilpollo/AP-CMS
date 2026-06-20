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
		auth.Post("/me/avatar", jwtMw, h.UploadAvatar)
	}

	{
		auth.Put("/me", jwtMw, h.Update)
	}

}

func RegisterUsersRoutes(app *fiber.App, h *handler.UserHandler, jwtMw fiber.Handler, authz output.AuthzRepository) {
	users := app.Group("/api/v1/users", jwtMw)

	{
		users.Get("", middleware.RequirePermission(authz, "users.manage"), h.Gets)
		users.Get("/:id", middleware.RequirePermission(authz, "users.manage"), h.GetByID)
	}

	{
		users.Post("", middleware.RequirePermission(authz, "users.manage"), h.Create)
	}

	{
		users.Put("/:id", middleware.RequirePermission(authz, "users.manage"), h.Update)
	}
}

func RegisterMediaRoutes(app *fiber.App, h *handler.MediaHandler, jwtMw fiber.Handler, authz output.AuthzRepository) {
	media := app.Group("/api/v1/media", jwtMw)

	{
		media.Get("", middleware.RequirePermission(authz, "media.manage"), h.Gets)
	}

	{
		media.Post("", middleware.RequirePermission(authz, "media.manage"), h.Upload)
	}
}

func RegisterPostsRoutes(app *fiber.App, h *handler.PostHandler, jwtMw fiber.Handler, authz output.AuthzRepository) {
	posts := app.Group("/api/v1/posts", jwtMw)

	{
		posts.Get("", middleware.RequirePermission(authz, "posts.read"), h.Gets)
		posts.Get("/:id/revisions", h.ListRevisions)
		posts.Get("/:slug", middleware.RequirePermission(authz, "posts.read"), h.GetBySlug)
	}

	{
		posts.Post("", middleware.RequirePermission(authz, "posts.edit_own"), h.Create)
		posts.Post("/:id/revisions/:rid/restore", jwtMw, h.RestoreRevision)
	}

	{
		posts.Put("/:id", middleware.RequirePermission(authz, "posts.edit_own"), h.Update)
	}

	{
		posts.Patch("/:id/status", middleware.RequirePermission(authz, "posts.publish"), h.ChangeStatus)
	}

	{
		posts.Delete("/:id", middleware.RequirePermission(authz, "posts.delete_own"), h.Delete)
	}
}

func RegisterCategoriesRoutes(app *fiber.App, h *handler.CategoriesHandler, jwtMw fiber.Handler, authz output.AuthzRepository) {
	categories := app.Group("/api/v1/categories", jwtMw)

	{
		categories.Get("", middleware.RequirePermission(authz, "categories.manage"), h.Gets)
		//categories.Get("/:id", middleware.RequirePermission(authz, "categories.read"), h.GetByID)
		categories.Get("/exists/:slug", middleware.RequirePermission(authz, "categories.manage"), h.SlugExists)
	}

	{
		categories.Post("", middleware.RequirePermission(authz, "categories.manage"), h.Create)
	}

	// {
	// 	categories.Put("/:id", middleware.RequirePermission(authz, "categories.edit_own"), h.Update)
	// }

	// {
	// 	categories.Delete("/:id", middleware.RequirePermission(authz, "categories.delete_own"), h.Delete)
	// }
}

func RegisterTagsRoutes(app *fiber.App, h *handler.TagHandler, jwtMw fiber.Handler, authz output.AuthzRepository) {
	tags := app.Group("/api/v1/tags", jwtMw)

	{
		tags.Get("", h.Gets)
		//tags.Get("/:id", middleware.RequirePermission(authz, "tags.read"), h.GetByID)
		//tags.Get("/exists/:slug", middleware.RequirePermission(authz, "tags.manage"), h.SlugExists)
	}

	// {
	// 	tags.Post("", middleware.RequirePermission(authz, "tags.manage"), h.Create)
	// }

	// {
	// 	tags.Put("/:id", middleware.RequirePermission(authz, "tags.edit_own"), h.Update)
	// }

	// {
	// 	tags.Delete("/:id", middleware.RequirePermission(authz, "tags.delete_own"), h.Delete)
	// }
}
