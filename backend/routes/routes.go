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
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
		}

		// New Simplified Embedded Endpoints
		api.GET("/topics/tree", h.GetTopicTree)
		api.GET("/topics/:id", h.GetTopicByID)
		api.GET("/lessons/:id", h.GetLessonByID)
		
		api.GET("/career/paths", h.GetCareerPaths)
		api.GET("/career/paths/:id", h.GetCareerPathByID)
		
		api.GET("/problems", h.GetProblems)
		api.GET("/problems/:id", h.GetProblemByID)
		api.POST("/problems/seed", h.SeedProblems)
		api.POST("/contests/seed", h.SeedContest)

		// Judge is public — no login required to run/submit code
		api.POST("/judge/execute", h.RunCode)
		api.POST("/judge/submit", h.SubmitCode)
		api.POST("/problems/patch-testcases", h.PatchTestCases)
		api.POST("/problems/seed-acceptance", h.SeedAcceptanceRates)
		
		// Protected endpoints
		protected := api.Group("/")
		protected.Use(AuthMiddleware())
		{
			protected.POST("/lessons/:id/quiz/submit", h.SubmitQuiz)
			protected.GET("/lessons/:id/quiz/submissions", h.GetQuizSubmissions)
			
			protected.POST("/lessons/:id/practice/submit", h.SubmitPractice)
			protected.GET("/lessons/:id/practice/submissions", h.GetPracticeSubmissions)
			
			protected.POST("/lessons/:id/complete", h.MarkLessonCompleted)
			protected.POST("/lessons/:id/incomplete", h.MarkLessonIncomplete)
			protected.POST("/lessons/:id/simulate", h.SimulateLesson)
			protected.GET("/progress/status", h.GetProgressStatus)
			
			protected.GET("/recommendations", h.GetRecommendations)
			
			protected.POST("/ai/chat", h.ChatWithAI)

			// User problem progress
			protected.GET("/user/problems/solved", h.GetSolvedProblems)
			protected.GET("/user/problems/stats", h.GetUserProblemStats)
			protected.POST("/user/problems/:id/solve", h.MarkProblemSolved)
			
			// Contest Routes
			protected.GET("/contests", h.GetContests)
			protected.POST("/contests", h.CreateContest)
			protected.DELETE("/contests/:id", h.DeleteContest)
			protected.GET("/leaderboard/global", h.GetGlobalLeaderboard)
			protected.GET("/contests/:id", h.GetContestDetails)
			protected.GET("/contests/:id/leaderboard", h.GetContestLeaderboard)
			
			// Teams
			protected.POST("/teams", h.CreateTeam)
			protected.GET("/teams", h.GetTeams)
			
			// Violations
			protected.POST("/violations", h.ReportViolation)
			protected.GET("/violations", h.GetViolations)
			
			protected.GET("/user/streak", h.GetStreakStats)
			protected.POST("/user/streak/ping", h.PingActivityStreak)
		}

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
