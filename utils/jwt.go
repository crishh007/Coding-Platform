package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateAccessToken(email string) (string, error) {

	secret := os.Getenv("JWT_SECRET")

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": email,
			"type":  "access",
			"exp":   time.Now().Add(time.Minute * 15).Unix(),
		},
	)

	tokenString, err := token.SignedString([]byte(secret))

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GenerateRefreshToken(email string) (string, error) {

	secret := os.Getenv("JWT_SECRET")

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": email,
			"type":  "refresh",
			"exp":   time.Now().Add(time.Hour * 24 * 7).Unix(),
		},
	)

	tokenString, err := token.SignedString([]byte(secret))

	if err != nil {
		return "", err
	}

	return tokenString, nil
}