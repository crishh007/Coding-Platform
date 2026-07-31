package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	clientOptions := options.Client().ApplyURI("mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0")
	client, err := mongo.Connect(clientOptions)
	if err != nil { log.Fatal(err) }
	
	collection := client.Database("learning_system").Collection("contests")
	
	// Delete all
	res, err := collection.DeleteMany(context.Background(), bson.M{})
	if err != nil { log.Fatal(err) }
	fmt.Printf("Deleted %v contests\n", res.DeletedCount)
	
	// Create a Past Contest (ended yesterday)
	startTime := time.Now().Add(-24 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)
	
	pastContest := bson.M{
		"_id":             "past-contest-123",
		"createdAt":       startTime.Add(-48 * time.Hour),
		"updatedAt":       startTime.Add(-48 * time.Hour),
		"title":           "Weekly Algorithm Challenge #42",
		"description":     "Test your algorithmic problem-solving skills in our flagship weekly contest. Features 3 problems ranging from easy to hard.",
		"startTime":       startTime,
		"endTime":         endTime,
		"duration":        120,
		"status":          "ended",
		"type":            "Weekly",
		"difficulty":      "Mixed",
		"maxParticipants": 500,
		"creatorId":       "admin",
		"isCustom":        false,
		"problems": []bson.M{
			{
				"problemId": "two-sum",
				"title": "Two Sum",
				"difficulty": "Easy",
				"points": 100,
				"order": 1,
			},
			{
				"problemId": "lru-cache",
				"title": "LRU Cache",
				"difficulty": "Medium",
				"points": 250,
				"order": 2,
			},
			{
				"problemId": "reverse-linked-list",
				"title": "Reverse Linked List",
				"difficulty": "Easy",
				"points": 100,
				"order": 3,
			},
		},
	}
	
	_, err = collection.InsertOne(context.Background(), pastContest)
	if err != nil { log.Fatal(err) }
	fmt.Println("Inserted 1 perfect past contest.")
}
