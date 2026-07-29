package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jayankchaudhary/moduleh-backend/internal/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	
	// Categories
	api.GET("/categories", handlers.GetCategories)
	api.POST("/categories", handlers.CreateCategory)
	
	// Discussions
	api.GET("/categories/:categoryId/discussions", handlers.GetDiscussions)
	api.POST("/discussions", handlers.CreateDiscussion)

	// Phase 2: Comments & Reactions
	api.GET("/threads/:threadId/comments", handlers.GetThreadComments)
	api.POST("/comments", handlers.CreateComment)
	api.POST("/reactions", handlers.AddReaction)

	// Phase 3: Solutions
	api.GET("/solutions", handlers.GetSolutions)
	api.POST("/solutions", handlers.UploadSolution)

	// Phase 4: Blogs
	api.GET("/blogs", handlers.GetBlogs)
	api.POST("/blogs", handlers.CreateBlog)

	// Phase 5: Leaderboard
	api.GET("/leaderboard", handlers.GetLeaderboard)
}
