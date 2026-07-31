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

	// Find the contest
	filter := bson.M{"_id": "5124d743-781f-4d32-8d46-372d07563c63"}
	var contest models.Contest
	err = db.Collection("contests").FindOne(ctx, filter).Decode(&contest)
	if err != nil {
		log.Fatal(err)
	}

	// Update points
	for i := range contest.Problems {
		contest.Problems[i].Points = 50
	}

	// Save back to DB
	update := bson.M{"$set": bson.M{"problems": contest.Problems}}
	_, err = db.Collection("contests").UpdateOne(ctx, filter, update)
	if err != nil {
		log.Fatal(err)
	}
	
	fmt.Println("Successfully updated problem points to 50!")
}
