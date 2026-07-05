package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

// ConnectDB establishes a connection to MongoDB
func ConnectDB() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		uri = "mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0" // Default to remote
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB: ", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB: ", err)
	}

	log.Println("Successfully connected to MongoDB!")
	Client = client
}

// GetCollection returns a MongoDB collection reference
func GetCollection(collectionName string) *mongo.Collection {
	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "placement_readiness"
	}
	return Client.Database(dbName).Collection(collectionName)
}
