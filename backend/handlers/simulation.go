package handlers

import (
	"context"
	"net/http"

	"skillsync-learning-system/models"
	"skillsync-learning-system/simulations/arrays"
	"skillsync-learning-system/simulations/searching"
	"skillsync-learning-system/simulations/sorting"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func (h *Handler) SimulateLesson(c *gin.Context) {
	id := c.Param("id")

	var req models.SimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Update lesson simulation progress if user is authenticated
	userID, exists := c.Get("user_id")
	if exists {
		filter := bson.M{"userId": userID, "lessonId": id}
		update := bson.M{
			"$set": bson.M{"completedSimulation": true},
		}
		// Upsert the progress record
		h.db.Collection("progress").UpdateOne(context.Background(), filter, update, options.UpdateOne().SetUpsert(true))
	}

	var lesson models.Lesson
	err := h.db.Collection("lessons").FindOne(context.Background(), bson.M{"_id": id}).Decode(&lesson)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lesson not found"})
		return
	}

	simType := lesson.VisualSimulation.Type

	var steps []models.StepState

	switch simType {
	case "binary-search":
		steps = searching.GenerateBinarySearchSteps(req.Array, req.Target)
	case "linear-search":
		steps = searching.GenerateLinearSearchSteps(req.Array, req.Target)
	case "jump-search":
		steps = searching.GenerateJumpSearchSteps(req.Array, req.Target)
	case "bubble-sort":
		steps = sorting.GenerateBubbleSortSteps(req)
	case "selection-sort":
		steps = sorting.GenerateSelectionSortSteps(req)
	case "insertion-sort":
		steps = sorting.GenerateInsertionSortSteps(req)
	case "merge-sort":
		steps = sorting.GenerateMergeSortSteps(req)
	case "quick-sort":
		steps = sorting.GenerateQuickSortSteps(req)
	case "heap-sort":
		steps = sorting.GenerateHeapSortSteps(req)
	case "kadanes-algorithm":
		steps = arrays.GenerateKadanesAlgorithmSteps(req)
	case "array-rotation":
		steps = arrays.GenerateArrayRotationSteps(req)
	case "matrix-transpose":
		steps = arrays.GenerateMatrixTransposeSteps(req)
	case "matrix-rotation":
		steps = arrays.GenerateMatrixRotationSteps(req)
	default:
		steps = []models.StepState{}
	}

	c.JSON(http.StatusOK, gin.H{
		"steps": steps,
	})
}
