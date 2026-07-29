package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/jayankchaudhary/moduleh-backend/internal/models"
	"github.com/jayankchaudhary/moduleh-backend/pkg/db"
)

// GetDiscussions fetches discussions for a specific category
func GetDiscussions(c *gin.Context) {
	categoryID := c.Param("categoryId")
	var discussions []models.Discussion
	
	if err := db.DB.Preload("Author").Preload("Tags").Where("category_id = ?", categoryID).Order("created_at desc").Find(&discussions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch discussions"})
		return
	}
	
	c.JSON(http.StatusOK, discussions)
}

// CreateDiscussion creates a new discussion thread
func CreateDiscussion(c *gin.Context) {
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		CategoryID  uint   `json:"category_id" binding:"required"`
		AuthorID    uint   `json:"author_id" binding:"required"` // For Phase 1 we pass this from frontend
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	discussion := models.Discussion{
		Title:       input.Title,
		Description: input.Description,
		CategoryID:  input.CategoryID,
		AuthorID:    input.AuthorID,
		Status:      "active",
	}

	if err := db.DB.Create(&discussion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create discussion"})
		return
	}

	// Fetch with author details to return
	db.DB.Preload("Author").First(&discussion, discussion.ID)

	c.JSON(http.StatusCreated, discussion)
}
