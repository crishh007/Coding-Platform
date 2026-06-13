package routes

import (
	"auth-service-go/controllers"
	"auth-service-go/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {

	router.POST("/register", controllers.Register)

	router.POST("/login", controllers.Login)

	router.POST("/refresh", controllers.RefreshToken)

	router.POST("/forgot-password", controllers.ForgotPassword)
	router.POST("/reset-password", controllers.ResetPassword)

	protected := router.Group("/api")

	protected.Use(middleware.AuthMiddleware())

	protected.GET("/me", controllers.GetProfile)
	protected.PUT("/me", controllers.UpdateProfile)
	protected.PUT("/change-password", controllers.ChangePassword)
	protected.DELETE("/me", controllers.DeleteAccount)

	admin := router.Group("/admin")

	admin.Use(middleware.AuthMiddleware())

	admin.Use(middleware.AdminMiddleware())

	admin.GET("/dashboard", controllers.AdminDashboard)
}
