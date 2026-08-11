package handlers

import (
	"net/http"
	"practice-backend/internal/executor"

	"github.com/gin-gonic/gin"
)

func ExecuteCode(c *gin.Context) {
	var req executor.ExecutionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if req.Code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code cannot be empty"})
		return
	}

	result := executor.Run(req)

	c.JSON(http.StatusOK, result)
}
