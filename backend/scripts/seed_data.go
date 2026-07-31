package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"codemastery-learning-system/models"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	client, err := mongo.Connect(options.Client().ApplyURI("mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("learning_system")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Seed Users
	users := []models.User{
		{Name: "Alex Johnson", Username: "alexj", Email: "alex@example.com", Role: "user", CurrentStreak: 90, GlobalRating: 2845},
		{Name: "Sarah Wu", Username: "swu99", Email: "sarah@example.com", Role: "user", CurrentStreak: 82, GlobalRating: 2790},
		{Name: "David Chen", Username: "dchen", Email: "david@example.com", Role: "user", CurrentStreak: 77, GlobalRating: 2650},
		{Name: "Emma Smith", Username: "emmas", Email: "emma@example.com", Role: "user", CurrentStreak: 45, GlobalRating: 1850},
		{Name: "Michael Doe", Username: "mdoe", Email: "michael@example.com", Role: "user", CurrentStreak: 12, GlobalRating: 1200},
	}

	for _, u := range users {
		u.ID = uuid.New().String()
		u.CreatedAt = time.Now()
		u.UpdatedAt = time.Now()
		
		// Check if user exists
		var existing models.User
		err := db.Collection("users").FindOne(ctx, bson.M{"username": u.Username}).Decode(&existing)
		if err != nil {
			_, err = db.Collection("users").InsertOne(ctx, u)
			if err != nil {
				fmt.Println("Failed to insert user:", err)
			} else {
				fmt.Println("Inserted seeded user:", u.Username)
			}
		}
	}

	// 2. Seed Violations
	violations := []models.Violation{
		{UserID: "alexj", ContestID: "contest-123", Type: "tab-switch", Description: "User switched tabs 3 times", Severity: "medium", Status: "pending"},
		{UserID: "swu99", ContestID: "contest-123", Type: "code-paste", Description: "Pasted 50 lines of code at once", Severity: "high", Status: "investigated"},
	}

	for _, v := range violations {
		v.ID = uuid.New().String()
		v.CreatedAt = time.Now()
		v.UpdatedAt = time.Now()
		_, err = db.Collection("violations").InsertOne(ctx, v)
		if err == nil {
			fmt.Println("Inserted violation for user:", v.UserID)
		}
	}

	fmt.Println("Seeding complete.")
}
