package config

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {

	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found — falling back to environment variables")
		return
	}

	log.Println(".env loaded successfully")
}
