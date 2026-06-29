package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "require"
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		sslmode,
	)

	var database *gorm.DB
	var err error

	// Retry with exponential backoff — avoids crash-loop on transient DB unavailability
	for attempt := 1; attempt <= 5; attempt++ {
		database, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err == nil {
			break
		}
		wait := time.Duration(attempt*attempt) * time.Second
		log.Printf("[DB] connect attempt %d/5 failed: %v — retrying in %s", attempt, err, wait)
		time.Sleep(wait)
	}

	if err != nil {
		log.Fatalf("[DB] could not connect after 5 attempts: %v", err)
	}

	// Configure connection pool — prevents exhausting Postgres max_connections
	sqlDB, err := database.DB()
	if err != nil {
		log.Fatalf("[DB] failed to get underlying sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(2 * time.Minute)

	DB = database
	log.Println("[DB] connected successfully")
}
