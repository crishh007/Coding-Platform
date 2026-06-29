package routes

import (
	"auth-service-go/controllers"
	"auth-service-go/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {

	// ── Public auth endpoints ─────────────────────────────────────────────────
	// RateLimiter(maxBurst, refillPerSecond):
	//   login:           5 burst, refills 1 token/20s  ≈ 3/min sustained
	//   register:        3 burst, refills 1 token/30s  ≈ 2/min sustained
	//   forgot-password: 3 burst, refills 1 token/60s  ≈ 1/min sustained
	//   reset-password:  3 burst, same as forgot

	router.POST("/register",
		middleware.RateLimiter(3, 1.0/30),
		controllers.Register,
	)
	router.POST("/login",
		middleware.RateLimiter(5, 1.0/20),
		controllers.Login,
	)
	router.POST("/refresh",
		middleware.RateLimiter(10, 1.0/6),
		controllers.RefreshToken,
	)
	router.POST("/forgot-password",
		middleware.RateLimiter(3, 1.0/60),
		controllers.ForgotPassword,
	)
	router.POST("/reset-password",
		middleware.RateLimiter(3, 1.0/60),
		controllers.ResetPassword,
	)

	// ── Protected user routes ─────────────────────────────────────────────────
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/me", controllers.GetProfile)
		protected.PUT("/me", controllers.UpdateProfile)
		protected.PUT("/change-password", controllers.ChangePassword)
		protected.DELETE("/me", controllers.DeleteAccount)
	}

	// ── Admin routes ──────────────────────────────────────────────────────────
	admin := router.Group("/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/dashboard", controllers.AdminDashboard)
	}
}
