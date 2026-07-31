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

func (h *Handler) ReportViolation(c *gin.Context) {
	var violation models.Violation
	if err := c.ShouldBindJSON(&violation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if userID, exists := c.Get("user_id"); exists {
		violation.UserID = userID.(string)
	}

	violation.ID = uuid.New().String()
	violation.CreatedAt = time.Now()
	violation.UpdatedAt = time.Now()
	if violation.Status == "" {
		violation.Status = "pending"
	}

	_, err := h.db.Collection("violations").InsertOne(context.Background(), violation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to report violation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    violation,
	})
}

func (h *Handler) GetViolations(c *gin.Context) {
	cursor, err := h.db.Collection("violations").Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch violations"})
		return
	}
	defer cursor.Close(context.Background())

	var violations []models.Violation
	if err = cursor.All(context.Background(), &violations); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode violations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    violations,
	})
}
