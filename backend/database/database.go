package database

import (
	"context"
	"log"

	"skillsync-learning-system/config"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func InitDB(cfg *config.Config) *mongo.Database {
	clientOptions := options.Client().ApplyURI(cfg.DBURL)
	client, err := mongo.Connect(clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping the database to verify connection
	if err := client.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Println("Successfully connected to MongoDB!")

	db := client.Database(cfg.DBName)
	DB = db
	return db
}
