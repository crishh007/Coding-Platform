package controllers

import (
	"net/http"

	"auth-service-go/database"
	"auth-service-go/models"
	"auth-service-go/utils"

	"github.com/gin-gonic/gin"
)

// claimsFromContext extracts typed Claims set by AuthMiddleware.
func claimsFromContext(c *gin.Context) (*utils.Claims, bool) {
	val, exists := c.Get("claims")
	if !exists {
		return nil, false
	}
	claims, ok := val.(*utils.Claims)
	return claims, ok
}

// GetProfile godoc
// @Summary      Get User Profile
// @Description  Get logged-in user profile
// @Tags         User
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Router       /api/me [get]
func GetProfile(c *gin.Context) {
	claims, ok := claimsFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
	})
}

// UpdateProfile godoc
// @Summary      Update User Profile
// @Description  Update username. Email change requires password confirmation.
// @Tags         User
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        profile  body      models.UpdateProfileInput  true  "Profile Data"
// @Success      200      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Router       /api/me [put]
func UpdateProfile(c *gin.Context) {
	claims, ok := claimsFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Email change requires password re-confirmation to prevent account takeover
	if input.Email != user.Email {
		if input.CurrentPassword == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "current_password is required to change your email address",
			})
			return
		}
		if !utils.CheckPasswordHash(input.CurrentPassword, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
			return
		}
	}

	user.Username = input.Username
	user.Email = input.Email

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update profile. Email or username may already be taken.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// ChangePassword godoc
// @Summary      Change Password
// @Description  Change user password
// @Tags         User
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        password  body      models.ChangePasswordInput  true  "Password Data"
// @Success      200       {object}  map[string]interface{}
// @Failure      401       {object}  map[string]interface{}
// @Router       /api/change-password [put]
func ChangePassword(c *gin.Context) {
	claims, ok := claimsFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if !utils.CheckPasswordHash(input.OldPassword, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	hashed, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password update failed"})
		return
	}

	if err := database.DB.Model(&user).Update("password", hashed).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password update failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// DeleteAccount godoc
// @Summary      Delete Account
// @Description  Permanently delete user account
// @Tags         User
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Router       /api/me [delete]
func DeleteAccount(c *gin.Context) {
	claims, ok := claimsFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := database.DB.Unscoped().Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted permanently"})
}
