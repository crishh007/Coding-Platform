package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBURL      string
	DBName     string
	ServerPort string
}

func LoadConfig() *Config {
	// Try to load .env, ignore if missing (relies on environment variables)
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Use MongoDB connection provided by user
		dbURL = "mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0"
	}

	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		dbName = "learning_system"
	}

	serverPort := os.Getenv("PORT")
	if serverPort == "" {
		serverPort = "8080"
	}

	return &Config{
		DBURL:      dbURL,
		DBName:     dbName,
		ServerPort: serverPort,
	}
}
