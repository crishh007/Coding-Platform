package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var ProblemCollection *mongo.Collection
var UserCollection *mongo.Collection

func InitMongo(uri string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Printf("WARNING: Failed to connect to MongoDB: %v. You must start Docker.", err)
		return
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("WARNING: Failed to ping MongoDB: %v. You must start Docker.", err)
		return
	}

	Client = client
	db := client.Database("codemastery")
	ProblemCollection = db.Collection("practice_problems")
	UserCollection = db.Collection("users")
	log.Println("Successfully connected to MongoDB")
}
