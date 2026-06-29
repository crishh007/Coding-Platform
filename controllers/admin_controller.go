package controllers

import "github.com/gin-gonic/gin"

// AdminDashboard godoc
// @Summary Admin Dashboard
// @Description Admin-only dashboard
// @Tags Admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /admin/dashboard [get]
func AdminDashboard(c *gin.Context) {

	c.JSON(200, gin.H{
		"message": "Welcome Admin",
	})
}
