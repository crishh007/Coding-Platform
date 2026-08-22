package main

import (
	"log"

	"skillsync-learning-system/config"
	"skillsync-learning-system/database"
	"skillsync-learning-system/handlers"
	"skillsync-learning-system/routes"
)

func main() {
	log.Println("Starting SkillSync Learning Engine (Embedded MongoDB Architecture)...")

	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Initialize Database
	db := database.InitDB(cfg)

	// 3. Initialize Handler Container
	h := handlers.NewHandler(db)

	// 4. Setup Routing & Middleware
	router := routes.SetupRouter(h)

	// 5. Start HTTP Server
	log.Printf("Server listening on port %s", cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
