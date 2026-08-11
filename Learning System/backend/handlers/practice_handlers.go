package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"codemastery-learning-system/database"
	"codemastery-learning-system/executor"
	"codemastery-learning-system/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// --- PRACTICE ENDPOINTS ---

func (h *Handler) GetProblems(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var problems []models.Problem
	// Only fetch necessary fields for the dashboard (exclude description/testcases)
	opts := options.Find().SetProjection(bson.M{"description": 0, "testCases": 0, "examples": 0})
	
	cursor, err := database.DB.Collection("practice_problems").Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch problems"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &problems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode problems"})
		return
	}

	if problems == nil {
		problems = []models.Problem{}
	}
	
	c.JSON(http.StatusOK, problems)
}

func (h *Handler) GetProblem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid problem ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var p models.Problem
	// Exclude hidden test cases from the client
	opts := options.FindOne().SetProjection(bson.M{"testCases.expected_output": 0})

	err = database.DB.Collection("practice_problems").FindOne(ctx, bson.M{"id": id}, opts).Decode(&p)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Problem not found"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *Handler) ExecuteCode(c *gin.Context) {
	var req executor.ExecutionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid execution payload"})
		return
	}

	// This runs the code using the executor engine
	res := executor.Run(req)
	c.JSON(http.StatusOK, res)
}
