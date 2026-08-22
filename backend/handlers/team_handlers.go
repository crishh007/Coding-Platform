package handlers

import (
	"context"
	"net/http"
	"time"

	"skillsync-learning-system/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (h *Handler) CreateTeam(c *gin.Context) {
	var team models.Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	team.ID = uuid.New().String()
	team.CreatedAt = time.Now()
	team.UpdatedAt = time.Now()

	_, err := h.db.Collection("teams").InsertOne(context.Background(), team)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    team,
	})
}

func (h *Handler) GetTeams(c *gin.Context) {
	cursor, err := h.db.Collection("teams").Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}
	defer cursor.Close(context.Background())

	var teams []models.Team
	if err = cursor.All(context.Background(), &teams); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode teams"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    teams,
	})
}
