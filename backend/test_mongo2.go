package main

import (
	"context"
	"fmt"
	"log"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	clientOptions := options.Client().ApplyURI("mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0")
	client, err := mongo.Connect(clientOptions)
	if err != nil { log.Fatal(err) }
	var result bson.M
	err = client.Database("learning_system").Collection("contests").FindOne(context.Background(), bson.M{"_id": "3e7cc1ef-45d6-4916-9419-d7512ee93e06"}).Decode(&result)
	if err != nil { log.Fatal(err) }
	fmt.Printf("%+v\n", result)
}
