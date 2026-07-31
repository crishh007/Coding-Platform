package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ─────────────────────────────────────────────
// Structs
// ─────────────────────────────────────────────

type UserProblemProgress struct {
	UserID    string    `bson:"userId"    json:"userId"`
	ProblemID string    `bson:"problemId" json:"problemId"`
	SolvedAt  time.Time `bson:"solvedAt"  json:"solvedAt"`
	Language  string    `bson:"language"  json:"language"`
}

// ─────────────────────────────────────────────
// POST /api/v1/user/problems/:id/solve
// Marks a problem as solved in MongoDB for the logged-in user
// ─────────────────────────────────────────────

func (h *Handler) MarkProblemSolved(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	userID := userIDRaw.(string)
	problemID := c.Param("id")

	var body struct {
		Language string `json:"language"`
	}
	c.ShouldBindJSON(&body)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"userId": userID, "problemId": problemID}
	update := bson.M{"$set": bson.M{
		"userId":    userID,
		"problemId": problemID,
		"solvedAt":  time.Now(),
		"language":  body.Language,
	}}
	opts := options.UpdateOne().SetUpsert(true)

	_, err := h.db.Collection("user_problem_progress").UpdateOne(ctx, filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save progress"})
		return
	}

	// Also bump acceptance count on the problem
	h.db.Collection("problems").UpdateOne(ctx,
		bson.M{"id": problemID},
		bson.M{"$inc": bson.M{"acceptedCount": 1}},
	)

	c.JSON(http.StatusOK, gin.H{"message": "Marked as solved!"})
}

// ─────────────────────────────────────────────
// GET /api/v1/user/problems/solved
// Returns list of solved problem IDs for current user
// ─────────────────────────────────────────────

func (h *Handler) GetSolvedProblems(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusOK, gin.H{"solved": []string{}})
		return
	}
	userID := userIDRaw.(string)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.db.Collection("user_problem_progress").Find(ctx, bson.M{"userId": userID})
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"solved": []string{}})
		return
	}
	defer cursor.Close(ctx)

	var progress []UserProblemProgress
	cursor.All(ctx, &progress)

	ids := make([]string, 0, len(progress))
	for _, p := range progress {
		ids = append(ids, p.ProblemID)
	}
	c.JSON(http.StatusOK, gin.H{"solved": ids})
}

// ─────────────────────────────────────────────
// GET /api/v1/user/problems/stats
// Returns per-difficulty solved counts for current user
// ─────────────────────────────────────────────

func (h *Handler) GetUserProblemStats(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusOK, gin.H{"easy": 0, "medium": 0, "hard": 0})
		return
	}
	userID := userIDRaw.(string)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get all solved problem IDs
	cursor, err := h.db.Collection("user_problem_progress").Find(ctx, bson.M{"userId": userID})
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"easy": 0, "medium": 0, "hard": 0})
		return
	}
	defer cursor.Close(ctx)

	var progress []UserProblemProgress
	cursor.All(ctx, &progress)

	if len(progress) == 0 {
		c.JSON(http.StatusOK, gin.H{"solved": []string{}, "easy": 0, "medium": 0, "hard": 0})
		return
	}

	// Fetch the actual problems to get their difficulties
	ids := make([]string, 0, len(progress))
	for _, p := range progress {
		ids = append(ids, p.ProblemID)
	}

	probCursor, err := h.db.Collection("problems").Find(ctx, bson.M{"id": bson.M{"$in": ids}})
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"solved": ids, "easy": 0, "medium": 0, "hard": 0})
		return
	}
	defer probCursor.Close(ctx)

	var problems []GlobalProblem
	probCursor.All(ctx, &problems)

	easy, medium, hard := 0, 0, 0
	for _, p := range problems {
		switch p.Difficulty {
		case "Easy":
			easy++
		case "Medium":
			medium++
		case "Hard":
			hard++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"solved":  ids,
		"easy":    easy,
		"medium":  medium,
		"hard":    hard,
		"history": progress,
	})
}
