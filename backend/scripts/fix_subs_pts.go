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

	var submissions []models.ContestSubmission
	cursor, err := db.Collection("contest_submissions").Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	if err = cursor.All(ctx, &submissions); err != nil {
		log.Fatal(err)
	}

	for _, sub := range submissions {
		if sub.Score == 0 {
			// update to 46 (since they got 12/13 passed)
			_, err = db.Collection("contest_submissions").UpdateOne(ctx, bson.M{"_id": sub.ID}, bson.M{"$set": bson.M{"score": 46}})
			if err != nil {
				log.Println("err updating sub", err)
			}
		}
	}
	
	fmt.Println("Successfully updated past submissions scores to 46!")
}
