package handlers

import (
	"context"
	"net/http"
	"sort"
	"time"

	"codemastery-learning-system/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func (h *Handler) GetContests(c *gin.Context) {
	// Prevent aggressive browser caching of GET requests
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

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
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "globalRating", Value: -1}})
	findOptions.SetLimit(100)

	cursor, err := h.db.Collection("users").Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users"})
		return
	}

	var leaderboard []map[string]interface{}
	for i, user := range users {
		tier := "Bronze"
		if user.GlobalRating > 2500 {
			tier = "Grandmaster"
		} else if user.GlobalRating > 2000 {
			tier = "Master"
		} else if user.GlobalRating > 1500 {
			tier = "Diamond"
		} else if user.GlobalRating > 1000 {
			tier = "Gold"
		} else if user.GlobalRating > 500 {
			tier = "Silver"
		}

		leaderboard = append(leaderboard, map[string]interface{}{
			"rank":       i + 1,
			"name":       user.Name,
			"handle":     user.Username,
			"rating":     user.GlobalRating,
			"solveCount": user.CurrentStreak * 5, // Just for some dummy stats based on streak
			"tier":       tier,
		})
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

func (h *Handler) DeleteContest(c *gin.Context) {
	contestID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var contest models.Contest
	err := h.db.Collection("contests").FindOne(ctx, bson.M{"_id": contestID}).Decode(&contest)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contest not found"})
		return
	}

	if contest.CreatorID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this contest"})
		return
	}

	_, err = h.db.Collection("contests").DeleteOne(ctx, bson.M{"_id": contestID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contest"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Contest deleted successfully"})
}

func (h *Handler) GetContestLeaderboard(c *gin.Context) {
	contestID := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.db.Collection("contest_submissions").Find(ctx, bson.M{"contestId": contestID, "status": "Accepted"})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submissions"})
		return
	}

	var submissions []models.ContestSubmission
	if err = cursor.All(ctx, &submissions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode submissions"})
		return
	}

	// Calculate scores
	userScores := make(map[string]int)
	userProblems := make(map[string]map[string]bool)

	for _, sub := range submissions {
		if userProblems[sub.UserID] == nil {
			userProblems[sub.UserID] = make(map[string]bool)
		}
		// Only add score if problem hasn't been solved yet by this user
		if !userProblems[sub.UserID][sub.ProblemID] {
			userScores[sub.UserID] += sub.Score
			userProblems[sub.UserID][sub.ProblemID] = true
		}
	}

	// Now build the leaderboard array and fetch user handles
	type LeaderboardEntry struct {
		Rank    int    `json:"rank"`
		Handle  string `json:"handle"`
		Score   int    `json:"score"`
		Penalty string `json:"penalty"`
	}

	var leaderboard []LeaderboardEntry

	for userID, score := range userScores {
		var user models.User
		err := h.db.Collection("users").FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
		handle := "Unknown"
		if err == nil {
			handle = user.Username
		}

		leaderboard = append(leaderboard, LeaderboardEntry{
			Handle:  handle,
			Score:   score,
			Penalty: "00:00:00", // Simplified penalty for now
		})
	}

	// Sort by score descending
	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Score > leaderboard[j].Score
	})

	// Assign ranks
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    leaderboard,
	})
}
