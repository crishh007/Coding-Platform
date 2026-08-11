package routes

import (
	"codemastery-learning-system/handlers"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func SetupRouter(h *handlers.Handler) *gin.Engine {
	r := gin.Default()
	r.Use(CORSMiddleware())

	api := r.Group("/api/v1")
	{
		// Auth Endpoints
		auth := api.Group("/auth")
		{
			auth.POST("/github", h.GithubLogin)
		}

		// New Simplified Embedded Endpoints
		api.GET("/topics/tree", h.GetTopicTree)
		api.GET("/topics/:id", h.GetTopicByID)
		api.GET("/lessons/:id", h.GetLessonByID)
		
		api.GET("/career/paths", h.GetCareerPaths)
		api.GET("/career/paths/:id", h.GetCareerPathByID)
		api.POST("/lessons/:id/simulate", h.SimulateLesson)
		
		api.POST("/lessons/:id/quiz/submit", h.SubmitQuiz)
		api.GET("/lessons/:id/quiz/submissions", h.GetQuizSubmissions)
		
		api.POST("/lessons/:id/practice/submit", h.SubmitPractice)
		api.GET("/lessons/:id/practice/submissions", h.GetPracticeSubmissions)
		
		api.POST("/lessons/:id/complete", h.MarkLessonCompleted)
		api.POST("/lessons/:id/incomplete", h.MarkLessonIncomplete)
		api.GET("/progress/status", h.GetProgressStatus)
		
		api.GET("/user/streak", h.GetStreakStats)
		api.POST("/user/streak/ping", h.PingActivityStreak)

		// Admin Endpoints
		admin := api.Group("/admin")
		{
			admin.POST("/courses", h.AdminCreateCourse)
			admin.POST("/topics", h.AdminCreateTopic)
			admin.POST("/lessons", h.AdminCreateLesson)
		}
	}

	return r
}
