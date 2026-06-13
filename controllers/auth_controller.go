package controllers

import (
	"net/http"
	"os"

	"auth-service-go/database"
	"auth-service-go/models"
	"auth-service-go/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Register godoc
// @Summary Register User
// @Description Register a new user account
// @Tags Auth
// @Accept json
// @Produce json
// @Param user body models.RegisterInput true "User Registration Data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /register [post]
func Register(c *gin.Context) {

	var input models.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	var existingUser models.User

	checkUser := database.DB.
		Unscoped().
		Where("email = ? OR username = ?", input.Email, input.Username).
		First(&existingUser)

	if checkUser.RowsAffected > 0 {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email or Username already exists",
		})

		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Password hashing failed",
		})

		return
	}

	// BUG FIX: was creating empty models.User{} instead of the actual user data
	newUser := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: hashedPassword,
	}

	result := database.DB.Create(&newUser)

	if result.Error != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": result.Error.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
	})
}

// Login godoc
// @Summary Login User
// @Description Authenticate user and return access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param user body models.LoginInput true "User Login Data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /login [post]
func Login(c *gin.Context) {

	var input models.LoginInput
	var user models.User

	if err := c.ShouldBindJSON(&input); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	result := database.DB.
		Where("email = ?", input.Email).
		First(&user)

	if result.Error != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
		})

		return
	}

	validPassword := utils.CheckPasswordHash(
		input.Password,
		user.Password,
	)

	if !validPassword {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
		})

		return
	}

	accessToken, err := utils.GenerateAccessToken(user.Email)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate access token",
		})

		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.Email)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate refresh token",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// ForgotPassword godoc
// @Summary Forgot Password
// @Description Verify user email before password reset
// @Tags Password
// @Accept json
// @Produce json
// @Param email body models.ForgotPasswordInput true "Email"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /forgot-password [post]
func ForgotPassword(c *gin.Context) {

	var input models.ForgotPasswordInput

	if err := c.ShouldBindJSON(&input); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	// Return same message regardless to prevent user enumeration
	c.JSON(http.StatusOK, gin.H{
		"message": "If that email exists, you may proceed to reset your password.",
	})
}

// ResetPassword godoc
// @Summary Reset Password
// @Description Reset user password with a new password
// @Tags Password
// @Accept json
// @Produce json
// @Param password body models.ResetPasswordInput true "New Password"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /reset-password [post]
func ResetPassword(c *gin.Context) {

	var input models.ResetPasswordInput

	if err := c.ShouldBindJSON(&input); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	var user models.User

	result := database.DB.
		Where("email = ?", input.Email).
		First(&user)

	if result.Error != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})

		return
	}

	hashedPassword, err := utils.HashPassword(input.NewPassword)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Password hashing failed",
		})

		return
	}

	user.Password = hashedPassword

	if err := database.DB.Save(&user).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to reset password",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}

// RefreshToken godoc
// @Summary Refresh Access Token
// @Description Generate a new access token using refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body models.RefreshTokenRequest true "Refresh Token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /refresh [post]
func RefreshToken(c *gin.Context) {

	var input models.RefreshTokenRequest

	if err := c.ShouldBindJSON(&input); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	token, err := jwt.Parse(
		input.RefreshToken,
		func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		},
	)

	if err != nil || !token.Valid {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid refresh token",
		})

		return
	}

	claims := token.Claims.(jwt.MapClaims)

	if claims["type"] != "refresh" {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token type",
		})

		return
	}

	email := claims["email"].(string)

	newAccessToken, err := utils.GenerateAccessToken(email)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate access token",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
	})
}
