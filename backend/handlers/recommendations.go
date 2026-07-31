package handlers

import (
	"context"
	"net/http"

	"codemastery-learning-system/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Recommendation struct {
	Title       string `json:"title"`
	Mode        string `json:"mode"`
	Dur         string `json:"dur"`
	Diff        string `json:"diff"`
	Color       string `json:"color"`
	Bg          string `json:"bg"`
	Border      string `json:"border"`
	Interactive bool   `json:"interactive"`
	Icon        string `json:"icon"`
}

func (h *Handler) GetRecommendations(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Fetch progress to make recommendations "smart"
	cursor, err := h.db.Collection("progress").Find(context.Background(), bson.M{"userId": userID})
	var progressList []models.Progress
	if err == nil {
		cursor.All(context.Background(), &progressList)
	}

	completedCount := len(progressList)

	recs := []Recommendation{}

	if completedCount > 0 {
		recs = append(recs, Recommendation{
			Title:       "Next up in your journey",
			Mode:        "Learn",
			Dur:         "30 min",
			Diff:        "Intermediate",
			Color:       "#10b981",
			Bg:          "rgba(16, 185, 129, 0.08)",
			Border:      "rgba(16, 185, 129, 0.25)",
			Interactive: true,
			Icon:        "BookOpen",
		})
	} else {
		recs = append(recs, Recommendation{
			Title:       "Graph Data Structure",
			Mode:        "Learn",
			Dur:         "28 min",
			Diff:        "Intermediate",
			Color:       "#f59e0b",
			Bg:          "rgba(245, 158, 11, 0.08)",
			Border:      "rgba(245, 158, 11, 0.25)",
			Interactive: true,
			Icon:        "BookOpen",
		})
	}

	recs = append(recs, Recommendation{
		Title:       "Top 50 Array Problems",
		Mode:        "Practice",
		Dur:         "50 problems",
		Diff:        "Easy - Hard",
		Color:       "#10b981",
		Bg:          "rgba(16, 185, 129, 0.08)",
		Border:      "rgba(16, 185, 129, 0.25)",
		Interactive: true,
		Icon:        "Code2",
	})
	
	recs = append(recs, Recommendation{
		Title:       "System Design Basics",
		Mode:        "Interview Prep",
		Dur:         "12 lessons",
		Diff:        "Intermediate",
		Color:       "#3b82f6",
		Bg:          "rgba(59, 130, 246, 0.08)",
		Border:      "rgba(59, 130, 246, 0.25)",
		Interactive: false,
		Icon:        "Briefcase",
	})
	
	recs = append(recs, Recommendation{
		Title:       "Build AI Chatbot",
		Mode:        "AI Learning",
		Dur:         "Project",
		Diff:        "Advanced",
		Color:       "#8b5cf6",
		Bg:          "rgba(139, 92, 246, 0.08)",
		Border:      "rgba(139, 92, 246, 0.25)",
		Interactive: false,
		Icon:        "Sparkles",
	})

	c.JSON(http.StatusOK, recs)
}
