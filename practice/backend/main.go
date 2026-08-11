package main

import (
	"log"
	"net/http"
	"os"

	"practice-backend/internal/db"
	"practice-backend/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // Practice backend runs on 8081
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	// Wait for MongoDB connection (will fail gracefully if not available)
	// We run it in a goroutine so it doesn't block if Docker isn't up yet
	go func() {
		db.InitMongo(mongoURI)
	}()

	r := gin.Default()

	// CORS config
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Practice Backend is running!"})
	})

	api := r.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/refresh", handlers.RefreshToken)
		}

		// Problem routes
		api.GET("/problems", handlers.GetProblems)
		api.GET("/problems/:id", handlers.GetProblem)
		api.POST("/problems", handlers.CreateProblem)

		// Code Execution Route
		api.POST("/execute", handlers.ExecuteCode)
	}

	log.Printf("Practice Backend listening on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
