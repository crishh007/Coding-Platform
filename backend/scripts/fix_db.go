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
	client, err := mongo.Connect(options.Client().ApplyURI("mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("learning_system")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = db.Collection("violations").DeleteMany(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Cleared violations.")
}
