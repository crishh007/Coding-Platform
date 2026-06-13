package main

import (
	"auth-service-go/config"
	"auth-service-go/database"
	"auth-service-go/models"
	"auth-service-go/routes"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "auth-service-go/docs"
)

// @title Auth Service API
// @version 1.0
// @description Authentication and User Management Service
// @host localhost:8000
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {

	config.LoadEnv()

	database.ConnectDatabase()

	database.DB.AutoMigrate(&models.User{})

	router := gin.Default()

	router.GET("/", func(c *gin.Context) {

		c.JSON(200, gin.H{
			"message": "Go Auth Service Running Successfully",
		})
	})

	routes.AuthRoutes(router)

	// Setup Swagger
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	router.Run(":8000")
}
