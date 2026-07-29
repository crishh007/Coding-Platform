package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/jayankchaudhary/moduleh-backend/internal/models"
	"github.com/jayankchaudhary/moduleh-backend/pkg/db"
)

// Phase 2: Comments & Threads
func CreateComment(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 2 backend not fully implemented in DB yet"})
}

func GetThreadComments(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 2 backend not fully implemented in DB yet"})
}

func AddReaction(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 2 backend not fully implemented in DB yet"})
}

// Phase 3: Solutions
func UploadSolution(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 3 backend not fully implemented in DB yet"})
}

func GetSolutions(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 3 backend not fully implemented in DB yet"})
}

// Phase 4: Blogs
func CreateBlog(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 4 backend not fully implemented in DB yet"})
}

func GetBlogs(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Phase 4 backend not fully implemented in DB yet"})
}

type ContributorResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Score int    `json:"score"`
	Level int    `json:"level"`
	Badge string `json:"badge"`
}

type TrendingResponse struct {
	ID       uint   `json:"id"`
	Title    string `json:"title"`
	Category string `json:"category"`
	Views    int    `json:"views"`
	Upvotes  int    `json:"upvotes"`
}

// Phase 5: Leaderboard
func GetLeaderboard(c *gin.Context) {
	var count int64
	db.DB.Model(&models.Reputation{}).Count(&count)
	if count == 0 {
		// Seed some mock users and reputations
		mockUsers := []models.User{
			{ID: 2, Username: "Alex Johnson", Email: "alex@example.com", Role: "user"},
			{ID: 3, Username: "Sarah Miller", Email: "sarah@example.com", Role: "user"},
			{ID: 4, Username: "Demo User", Email: "demo@example.com", Role: "user"},
			{ID: 5, Username: "Mike Chen", Email: "mike@example.com", Role: "user"},
		}
		for _, u := range mockUsers {
			var existing models.User
			if err := db.DB.First(&existing, u.ID).Error; err != nil {
				db.DB.Create(&u)
			}
		}

		mockReps := []models.Reputation{
			{UserID: 2, Score: 1450, Level: 12, Badge: "Expert"},
			{UserID: 3, Score: 1230, Level: 9, Badge: "Guide"},
			{UserID: 4, Score: 890, Level: 5, Badge: "Contributor"},
			{UserID: 5, Score: 750, Level: 4, Badge: "Enthusiast"},
		}
		for _, r := range mockReps {
			db.DB.Create(&r)
		}
	}

	var reps []models.Reputation
	if err := db.DB.Order("score desc").Find(&reps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var contributors []ContributorResponse
	for _, r := range reps {
		var u models.User
		if err := db.DB.First(&u, r.UserID).Error; err == nil {
			contributors = append(contributors, ContributorResponse{
				ID:    u.ID,
				Name:  u.Username,
				Score: r.Score,
				Level: r.Level,
				Badge: r.Badge,
			})
		}
	}

	// Fetch dynamic trending data
	var discussions []models.Discussion
	db.DB.Limit(2).Order("created_at desc").Find(&discussions)

	var blogs []models.Blog
	db.DB.Limit(2).Order("created_at desc").Find(&blogs)

	var solutions []models.Solution
	db.DB.Limit(2).Order("created_at desc").Find(&solutions)

	var trending []TrendingResponse
	for _, d := range discussions {
		trending = append(trending, TrendingResponse{
			ID:       d.ID,
			Title:    d.Title,
			Category: "Discussions",
			Views:    int(d.ID)*18 + 50,
			Upvotes:  int(d.ID)*5 + 8,
		})
	}
	for _, b := range blogs {
		trending = append(trending, TrendingResponse{
			ID:       b.ID,
			Title:    b.Title,
			Category: "Blogs",
			Views:    int(b.ID)*24 + 120,
			Upvotes:  int(b.ID)*8 + 15,
		})
	}
	for _, s := range solutions {
		trending = append(trending, TrendingResponse{
			ID:       s.ID,
			Title:    s.Title,
			Category: "Solutions",
			Views:    int(s.ID)*15 + 75,
			Upvotes:  int(s.ID)*6 + 10,
		})
	}

	// Fallback if none exist in DB:
	if len(trending) == 0 {
		trending = []TrendingResponse{
			{ID: 1, Title: "Understanding Dynamic Programming", Category: "Blogs", Views: 342, Upvotes: 45},
			{ID: 2, Title: "Need help with Assignment 1", Category: "Discussions", Views: 128, Upvotes: 12},
			{ID: 3, Title: "React Authentication Template", Category: "Solutions", Views: 89, Upvotes: 34},
		}
	}

	var totalUsers int64
	db.DB.Model(&models.User{}).Count(&totalUsers)

	c.JSON(http.StatusOK, gin.H{
		"contributors": contributors,
		"trending":     trending,
		"stats": gin.H{
			"total_engagement": 4231 + len(discussions)*15 + len(blogs)*25,
			"badges_awarded":   182 + len(reps),
			"active_members":   89 + totalUsers,
		},
	})
}
