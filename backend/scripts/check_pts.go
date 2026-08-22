package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"skillsync-learning-system/models"
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

	var contest models.Contest
	err = db.Collection("contests").FindOne(ctx, bson.M{"_id": "5124d743-781f-4d32-8d46-372d07563c63"}).Decode(&contest)
	if err != nil {
		log.Fatal(err)
	}
	
	for _, p := range contest.Problems {
		fmt.Printf("Problem %s has Points %d\n", p.ProblemID, p.Points)
	}
}
