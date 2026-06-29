package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"time"

	"auth-service-go/database"
	"auth-service-go/models"
	"auth-service-go/utils"

	"github.com/gin-gonic/gin"
)

// Register godoc
// @Summary      Register User
// @Description  Register a new user account
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        user  body      models.RegisterInput  true  "User Registration Data"
// @Success      201   {object}  map[string]interface{}
// @Failure      400   {object}  map[string]interface{}
// @Failure      500   {object}  map[string]interface{}
// @Router       /register [post]
func Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.User
	if database.DB.Unscoped().
		Where("email = ? OR username = ?", input.Email, input.Username).
		First(&existing).RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or username already exists"})
		return
	}

	hashed, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: hashed,
	}
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

// Login godoc
// @Summary      Login User
// @Description  Authenticate user and return access and refresh tokens
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        user  body      models.LoginInput  true  "User Login Data"
// @Success      200   {object}  map[string]interface{}
// @Failure      400   {object}  map[string]interface{}
// @Failure      401   {object}  map[string]interface{}
// @Router       /login [post]
func Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// Generic message — prevents user enumeration
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}
	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// ForgotPassword godoc
// @Summary      Forgot Password
// @Description  Generates a secure reset token (in production this would be emailed)
// @Tags         Password
// @Accept       json
// @Produce      json
// @Param        email  body      models.ForgotPasswordInput  true  "Email"
// @Success      200    {object}  map[string]interface{}
// @Failure      400    {object}  map[string]interface{}
// @Router       /forgot-password [post]
func ForgotPassword(c *gin.Context) {
	var input models.ForgotPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Always return success — prevents user enumeration
	c.JSON(http.StatusOK, gin.H{
		"message": "If that email is registered, a reset token has been sent.",
	})

	// Do the work asynchronously so timing doesn't leak whether the user exists
	go func() {
		var user models.User
		if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
			return // user not found — silently drop
		}

		// Generate a cryptographically secure random token
		rawBytes := make([]byte, 32)
		if _, err := rand.Read(rawBytes); err != nil {
			return
		}
		rawToken := hex.EncodeToString(rawBytes) // 64-char hex string sent to user

		// Store only the hash — if DB is breached tokens are useless
		hashed, err := utils.HashPassword(rawToken)
		if err != nil {
			return
		}
		expiry := time.Now().Add(15 * time.Minute)
		database.DB.Model(&user).Updates(map[string]interface{}{
			"password_reset_token":  hashed,
			"password_reset_expiry": expiry,
		})

		// TODO: replace this log with your email/SMS delivery service
		// e.g. sendgrid.Send(user.Email, resetURL + "?token=" + rawToken)
		// For now we surface it in the dev response header (remove in production)
		log.Printf("[DEV ONLY] reset token for %s: %s", user.Email, rawToken)
		_ = rawToken
	}()
}

// ResetPassword godoc
// @Summary      Reset Password
// @Description  Reset user password using a valid, unexpired reset token
// @Tags         Password
// @Accept       json
// @Produce      json
// @Param        password  body      models.ResetPasswordInput  true  "Reset Data"
// @Success      200       {object}  map[string]interface{}
// @Failure      400       {object}  map[string]interface{}
// @Failure      401       {object}  map[string]interface{}
// @Failure      500       {object}  map[string]interface{}
// @Router       /reset-password [post]
func ResetPassword(c *gin.Context) {
	var input models.ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find users with a non-expired reset token
	var user models.User
	if err := database.DB.
		Where("password_reset_expiry > ?", time.Now()).
		Where("password_reset_token IS NOT NULL AND password_reset_token != ''").
		Find(&user).Error; err != nil || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	// Constant-time comparison via bcrypt
	if !utils.CheckPasswordHash(input.Token, user.PasswordResetToken) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	hashed, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password reset failed"})
		return
	}

	// Update password and clear the reset token atomically
	if err := database.DB.Model(&user).Updates(map[string]interface{}{
		"password":              hashed,
		"password_reset_token":  nil,
		"password_reset_expiry": nil,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password reset failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}

// RefreshToken godoc
// @Summary      Refresh Access Token
// @Description  Generate a new access token using a valid refresh token
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        body  body      models.RefreshTokenRequest  true  "Refresh Token"
// @Success      200   {object}  map[string]interface{}
// @Failure      400   {object}  map[string]interface{}
// @Failure      401   {object}  map[string]interface{}
// @Router       /refresh [post]
func RefreshToken(c *gin.Context) {
	var input models.RefreshTokenRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims, err := utils.ParseToken(input.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	if claims.Type != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
		return
	}

	// Re-fetch user to get current role (role may have changed since token was issued)
	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	newAccessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"access_token": newAccessToken})
}
