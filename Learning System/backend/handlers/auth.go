package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type GithubLoginRequest struct {
	Code string `json:"code" binding:"required"`
}

type GithubAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	Scope       string `json:"scope"`
	TokenType   string `json:"token_type"`
	Error       string `json:"error"`
	ErrorDesc   string `json:"error_description"`
}

func (h *Handler) GithubLogin(c *gin.Context) {
	var req GithubLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	clientID := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")

	// If keys are not set, return a mock response for testing/UI purposes
	if clientID == "" || clientID == "your_github_client_id_here" {
		// Mock a successful OAuth flow since keys aren't configured yet
		c.JSON(http.StatusOK, gin.H{
			"access_token": "mock_github_token_backend",
			"user": gin.H{
				"username": "Mock GitHub User",
				"email":    "mock@github.com",
				"role":     "developer",
			},
		})
		return
	}

	// 1. Exchange code for access token
	tokenURL := "https://github.com/login/oauth/access_token"
	requestBody, _ := json.Marshal(map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"code":          req.Code,
	})

	tokenReq, err := http.NewRequest("POST", tokenURL, bytes.NewBuffer(requestBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token request"})
		return
	}
	tokenReq.Header.Set("Content-Type", "application/json")
	tokenReq.Header.Set("Accept", "application/json")

	client := &http.Client{}
	tokenResp, err := client.Do(tokenReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to request token from GitHub"})
		return
	}
	defer tokenResp.Body.Close()

	var tokenData GithubAccessTokenResponse
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode token response"})
		return
	}

	if tokenData.Error != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("GitHub OAuth Error: %s", tokenData.ErrorDesc)})
		return
	}

	// 2. Fetch user profile from GitHub
	userReq, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user request"})
		return
	}
	userReq.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)
	userReq.Header.Set("Accept", "application/vnd.github.v3+json")

	userResp, err := client.Do(userReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
		return
	}
	defer userResp.Body.Close()

	var userData map[string]interface{}
	if err := json.NewDecoder(userResp.Body).Decode(&userData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user profile"})
		return
	}

	// 3. Return user data and mock access token (in a real app, generate a JWT here)
	username := userData["login"].(string)
	if name, ok := userData["name"].(string); ok && name != "" {
		username = name
	}
	
	email := ""
	if emailVal, ok := userData["email"].(string); ok {
		email = emailVal
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenData.AccessToken,
		"user": gin.H{
			"username": username,
			"email":    email,
			"role":     "developer",
		},
	})
}
