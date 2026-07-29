package db

import (
	"fmt"
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"github.com/jayankchaudhary/moduleh-backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")
	var err error

	if dsn != "" {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Printf("Failed to connect to PostgreSQL at DATABASE_URL: %v. Falling back to local SQLite.", err)
			dsn = ""
		} else {
			fmt.Println("PostgreSQL connection established via DATABASE_URL")
		}
	}

	if dsn == "" {
		// Try local postgres first, if that fails, use sqlite
		localDSN := "host=localhost user=postgres password=postgres dbname=moduleh port=5432 sslmode=disable TimeZone=UTC"
		DB, err = gorm.Open(postgres.Open(localDSN), &gorm.Config{})
		if err != nil {
			log.Println("Local PostgreSQL not available/failed. Using SQLite fallback: moduleh.db")
			DB, err = gorm.Open(sqlite.Open("moduleh.db"), &gorm.Config{})
			if err != nil {
				log.Fatal("Failed to connect to SQLite database:", err)
			}
		} else {
			fmt.Println("Local PostgreSQL connection established")
		}
	}

	// Auto-migrate models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Tag{},
		&models.Discussion{},
		&models.Thread{},
		&models.ForumSetting{},
		&models.Comment{},
		&models.Reaction{},
		&models.Solution{},
		&models.SolutionVersion{},
		&models.Blog{},
		&models.Reputation{},
	)
	if err != nil {
		log.Fatal("Failed to auto-migrate:", err)
	}
	
	fmt.Println("Database migration completed")

	// Seed default user
	var user models.User
	if err := DB.First(&user, 1).Error; err != nil {
		fmt.Println("Seeding default user...")
		defaultUser := models.User{
			ID:       1,
			Username: "Admin",
			Email:    "admin@example.com",
			Role:     "admin",
		}
		if err := DB.Create(&defaultUser).Error; err != nil {
			log.Printf("Failed to seed default user: %v", err)
		} else {
			fmt.Println("Default user seeded successfully.")
		}
	}

	// Seed some initial categories if empty
	var count int64
	DB.Model(&models.Category{}).Count(&count)
	if count == 0 {
		fmt.Println("Seeding initial categories...")
		categories := []models.Category{
			{ID: 1, Name: "General Discussion", Description: "Talk about anything related to the platform.", OrderIndex: 1, Tags: []models.Tag{{Name: "general"}}},
			{ID: 2, Name: "Course Help", Description: "Ask questions and get help with your courses.", OrderIndex: 2, Tags: []models.Tag{{Name: "help"}, {Name: "courses"}}},
			{ID: 3, Name: "Announcements", Description: "Official news and updates.", OrderIndex: 3, Tags: []models.Tag{{Name: "news"}}},
		}
		for _, cat := range categories {
			if err := DB.Create(&cat).Error; err != nil {
				log.Printf("Failed to seed category %s: %v", cat.Name, err)
			}
		}
		fmt.Println("Initial categories seeded successfully.")
	}
}
