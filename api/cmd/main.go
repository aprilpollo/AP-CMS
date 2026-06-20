package main

import (
	"apcms/internal/adapters/config"
	"apcms/internal/adapters/email"
	"apcms/internal/adapters/routes"
	"apcms/internal/adapters/routes/handler"
	"apcms/internal/adapters/routes/middleware"
	"apcms/internal/adapters/storage/cache"
	"apcms/internal/adapters/storage/objectstore"
	"apcms/internal/adapters/storage/orm"
	"apcms/internal/adapters/storage/repository"
	"apcms/internal/core/ports/output"
	"apcms/internal/core/services"
	jwtpkg "apcms/internal/pkg/jwt"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"runtime/debug"
	"time"
)

func main() {
	cfg, err := config.GetConfig()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("✔ [INFO] Loading Configuration")

	db, err := orm.NewGormDB(cfg.Database, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	fmt.Println("✔ [INFO] Database Connection")

	redis, err := cache.NewRedisClient(cfg.Redis)
	if err != nil {
		log.Fatal(err)
	}
	defer redis.Close()

	fmt.Println("✔ [INFO] Redis Connection")

	// --- Repositories (output adapters) ---
	authzRepo := repository.NewAuthzRepository(db.GetDB())
	auditRepo := repository.NewAuditRepository(db.GetDB())
	userRepo := repository.NewUserRepository(db.GetDB())
	mediaRepo := repository.NewMediaRepository(db.GetDB())
	postRepo := repository.NewPostRepository(db.GetDB())
	categoriesRepo := repository.NewCategoriesRepository(db.GetDB())
	tagRepo := repository.NewTagRepository(db.GetDB())
	sessionStore := cache.NewSessionStore(redis)
	emailSender := email.NewClient(cfg.EmailAPI.ServiceURL)

	// Object storage (S3/MinIO) — non-fatal: media uploads degrade gracefully if down.
	var fileStorage output.FileStorage
	if fs, fsErr := objectstore.NewMinioStorage(cfg.S3); fsErr != nil {
		log.Printf("[WARN] object storage unavailable: %v", fsErr)
	} else {
		fileStorage = fs
		fmt.Println("✔ [INFO] Object Storage Connection")
	}

	// --- Auth primitives ---
	tokenTTL := time.Duration(cfg.JWT.JwtExpireDaysCount) * 24 * time.Hour
	jwtManager := jwtpkg.NewManager(cfg.JWT.SecretKey, cfg.JWT.Issuer, tokenTTL)
	refreshTTL := tokenTTL

	// --- Services (core / use cases) ---
	authSvc := services.NewAuthService(userRepo, sessionStore, auditRepo, authzRepo, emailSender, fileStorage, jwtManager, refreshTTL, cfg.EmailAPI.ResetURL)
	userSvc := services.NewUserService(userRepo, emailSender, sessionStore, cfg.EmailAPI.VerifyURL)
	mediaSvc := services.NewMediaService(mediaRepo, fileStorage)
	postSvc := services.NewPostService(postRepo, tagRepo)
	categoriesSvc := services.NewCategoriesService(categoriesRepo)
	tagSvc := services.NewTagService(tagRepo)

	// --- Handlers (input adapters) ---
	authHandler := handler.NewAuthHandler(authSvc)
	userHandler := handler.NewUserHandler(userSvc)
	mediaHandler := handler.NewMediaHandler(mediaSvc)
	postHandler := handler.NewPostHandler(postSvc, authzRepo)
	categoriesHandler := handler.NewCategoriesHandler(categoriesSvc)
	tagHandler := handler.NewTagHandler(tagSvc)

	// --- Middleware ---
	jwtMiddleware := middleware.JWT(jwtManager)
	// optionalJwtMiddleware := middleware.OptionalJWT(jwtManager)

	// --- Fiber app ---
	app := fiber.New(fiber.Config{
		AppName: cfg.App.AppName,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.App.AllowedCredentialOrigins,
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Authorization",
		//AllowCredentials: true,
	}))

	app.Use(fiberLogger.New(fiberLogger.Config{
		Format: "${time} | ${status} | ${latency} | ${ip} | ${method} | ${path}\n",
	}))

	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
			log.Printf("[PANIC] path=%s method=%s error=%v\n%s",
				c.Path(),
				c.Method(),
				e,
				debug.Stack(),
			)
			c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "internal server error",
			})
		},
	}))

	// --- Routes ---
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"app":     cfg.App.AppName,
			"version": cfg.App.AppVersion,
		})
	})

	routes.RegisterAuthRoutes(app, authHandler, jwtMiddleware)
	routes.RegisterUsersRoutes(app, userHandler, jwtMiddleware, authzRepo)
	routes.RegisterMediaRoutes(app, mediaHandler, jwtMiddleware, authzRepo)
	routes.RegisterPostsRoutes(app, postHandler, jwtMiddleware, authzRepo)
	routes.RegisterCategoriesRoutes(app, categoriesHandler, jwtMiddleware, authzRepo)
	routes.RegisterTagsRoutes(app, tagHandler, jwtMiddleware, authzRepo)
	// --- Start server ---
	if err := app.Listen(fmt.Sprintf(":%s", cfg.App.ApiPort)); err != nil {
		log.Println(err)
	}
}
