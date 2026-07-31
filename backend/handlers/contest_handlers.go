package handlers

import (
	"context"
	"net/http"
	"time"

	"codemastery-learning-system/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (h *Handler) GetContests(c *gin.Context) {
	cursor, err := h.db.Collection("contests").Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contests"})
		return
	}
	defer cursor.Close(context.Background())

	var contests []models.Contest
	if err = cursor.All(context.Background(), &contests); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode contests"})
		return
	}

	var upcoming []models.Contest
	var past []models.Contest
	var ongoing []models.Contest
	now := time.Now()

	for _, contest := range contests {
		if contest.EndTime.Before(now) {
			past = append(past, contest)
		} else if contest.StartTime.Before(now) && contest.EndTime.After(now) {
			ongoing = append(ongoing, contest)
		} else {
			upcoming = append(upcoming, contest)
		}
	}

	if upcoming == nil {
		upcoming = make([]models.Contest, 0)
	}
	if past == nil {
		past = make([]models.Contest, 0)
	}
	if ongoing == nil {
		ongoing = make([]models.Contest, 0)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"upcoming": upcoming,
			"past":     past,
			"ongoing":  ongoing,
		},
	})
}

func (h *Handler) GetGlobalLeaderboard(c *gin.Context) {
	// Dummy data for global leaderboard (as requested to just do actual queries for contests, teams, violations)
	leaderboard := []map[string]interface{}{
		{"rank": 1, "name": "Alex Johnson", "handle": "alexj", "rating": 2845, "solveCount": 452, "tier": "Grandmaster"},
		{"rank": 2, "name": "Sarah Wu", "handle": "swu99", "rating": 2790, "solveCount": 410, "tier": "Master"},
		{"rank": 3, "name": "David Chen", "handle": "dchen", "rating": 2650, "solveCount": 389, "tier": "Master"},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    leaderboard,
	})
}

func (h *Handler) GetContestDetails(c *gin.Context) {
	id := c.Param("id")
	var contest models.Contest
	err := h.db.Collection("contests").FindOne(context.Background(), bson.M{"_id": id}).Decode(&contest)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contest not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    contest,
	})
}

func (h *Handler) SeedContest(c *gin.Context) {
	contest := models.Contest{
		Title:       "Test Contest",
		Description: "A temporary test contest.",
		StartTime:   time.Now(),
		EndTime:     time.Now().Add(time.Hour * 2),
		Duration:    120,
		Status:      "active",
		Type:        "Weekly",
		Difficulty:  "Medium",
		MaxParticipants: 100,
	}
	contest.ID = uuid.New().String()
	contest.CreatedAt = time.Now()
	contest.UpdatedAt = time.Now()

	_, err := h.db.Collection("contests").InsertOne(context.Background(), contest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to seed contest"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    contest,
	})
}

func (h *Handler) CreateContest(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		Title           string                  `json:"title"`
		Description     string                  `json:"description"`
		StartTime       time.Time               `json:"startTime"`
		Duration        int                     `json:"duration"`
		MaxParticipants int                     `json:"maxParticipants"`
		Problems        []models.ContestProblem `json:"problems"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	contest := models.Contest{
		Title:           req.Title,
		Description:     req.Description,
		StartTime:       req.StartTime,
		EndTime:         req.StartTime.Add(time.Duration(req.Duration) * time.Minute),
		Duration:        req.Duration,
		Status:          "upcoming",
		Type:            "Custom",
		Difficulty:      "Mixed",
		MaxParticipants: req.MaxParticipants,
		CreatorID:       userID.(string),
		IsCustom:        true,
		Problems:        req.Problems,
	}

	contest.ID = uuid.New().String()
	contest.CreatedAt = time.Now()
	contest.UpdatedAt = time.Now()

	_, err := h.db.Collection("contests").InsertOne(context.Background(), contest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contest"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    contest,
	})
}

