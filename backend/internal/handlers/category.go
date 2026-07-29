package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/jayankchaudhary/moduleh-backend/internal/models"
	"github.com/jayankchaudhary/moduleh-backend/pkg/db"
)

// GetCategories returns all forum categories
func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := db.DB.Preload("Tags").Order("order_index asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// CreateCategory creates a new forum category
func CreateCategory(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		OrderIndex  int    `json:"order_index"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{
		Name:        input.Name,
		Description: input.Description,
		OrderIndex:  input.OrderIndex,
	}

	if err := db.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}
