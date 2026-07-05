package main

import (
	"log"
	"os"

	"module_i_backend/internal/db"
	"module_i_backend/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// Connect to MongoDB
	db.ConnectDB()
	
	// Seed Database with initial mock data
	handlers.SeedMockData()

	r := gin.Default()

	// CORS Setup
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong"})
		})
		
		// Resume Routes
		resumes := api.Group("/resumes")
		{
			resumes.GET("", handlers.GetResumes)
			resumes.POST("", handlers.CreateResume)
			resumes.GET("/:id", handlers.GetResume)
			resumes.PUT("/:id", handlers.UpdateResume)
			resumes.DELETE("/:id", handlers.DeleteResume)
			resumes.GET("/:id/preview", handlers.PreviewResume)
			resumes.GET("/:id/ats-score", handlers.CalculateATSScore)
			resumes.POST("/enhance-bullet", handlers.EnhanceBullet)
			resumes.POST("/parse-pdf", handlers.ParsePDF)
		}

		// Interview Routes
		interview := api.Group("/interview")
		{
			interview.GET("/default-questions", handlers.GetDefaultQuestions)
			interview.POST("/generate-questions", handlers.GenerateQuestions)
			interview.POST("/evaluate", handlers.EvaluateInterview)
			interview.GET("/evaluations", handlers.GetEvaluations)
			interview.POST("/coding", handlers.CodingInterviewChat)
		}

		// Aptitude Routes
		aptitude := api.Group("/aptitude")
		{
			aptitude.GET("/generate", handlers.GenerateAptitudeTest)
			aptitude.POST("/submit", handlers.SubmitAptitudeTest)
		}

		// System Design Routes
		systemDesign := api.Group("/system-design")
		{
			systemDesign.GET("/cases", handlers.GetSystemDesignCases)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}

