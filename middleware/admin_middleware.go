package middleware

import (
	"auth-service-go/database"
	"auth-service-go/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AdminMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		userData, exists := c.Get("user")

		if !exists {

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found",
			})

			c.Abort()
			return
		}

		claims := userData.(jwt.MapClaims)

		email := claims["email"].(string)

		var user models.User

		database.DB.Where("email = ?", email).First(&user)

		if user.Role != "admin" {

			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access required",
			})

			c.Abort()
			return
		}

		c.Next()
	}
}