package middleware

import (
	"net/http"
	"strings"

	"auth-service-go/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format. Expected: Bearer <token>"})
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Reject refresh tokens on protected routes
		if claims.Type != "access" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Access token required"})
			c.Abort()
			return
		}

		c.Set("claims", claims)
		c.Next()
	}
}
