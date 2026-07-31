package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"codemastery-learning-system/models"
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

	cursor, err := db.Collection("contest_submissions").Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	var results []models.ContestSubmission
	if err = cursor.All(ctx, &results); err != nil {
		log.Fatal("Decode Error: ", err)
	}
	for _, s := range results {
		fmt.Printf("Sub: User=%s Prob=%s Score=%d Status=%s\n", s.UserID, s.ProblemID, s.Score, s.Status)
	}
}
