package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"practice-backend/internal/db"
	"practice-backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetProblems(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var problems []models.Problem
	// Only fetch necessary fields for the dashboard (exclude description/testcases)
	opts := options.Find().SetProjection(bson.M{"description": 0, "testCases": 0, "examples": 0})
	
	cursor, err := db.ProblemCollection.Find(ctx, bson.M{}, opts)
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

func GetProblem(c *gin.Context) {
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

	err = db.ProblemCollection.FindOne(ctx, bson.M{"id": id}, opts).Decode(&p)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Problem not found"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func CreateProblem(c *gin.Context) {
	var p models.Problem
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find the max ID to autoincrement
	var lastProblem models.Problem
	opts := options.FindOne().SetSort(bson.D{{Key: "id", Value: -1}})
	err := db.ProblemCollection.FindOne(ctx, bson.M{}, opts).Decode(&lastProblem)
	
	newID := 1
	if err == nil {
		newID = lastProblem.ProblemID + 1
	}
	p.ProblemID = newID

	res, err := db.ProblemCollection.InsertOne(ctx, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create problem"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Problem created", "_id": res.InsertedID, "id": p.ProblemID})
}
