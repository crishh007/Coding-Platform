package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"skillsync-learning-system/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	clientOptions := options.Client().ApplyURI("mongodb+srv://Ratnam1021:Rattu%401021@cluster0.wmbwf.mongodb.net/?appName=Cluster0")
	client, err := mongo.Connect(clientOptions)
	if err != nil { log.Fatal(err) }
	
	var contests []models.Contest
	cursor, _ := client.Database("learning_system").Collection("contests").Find(context.Background(), bson.M{})
	cursor.All(context.Background(), &contests)
	
	bytes, _ := json.Marshal(contests)
	fmt.Println(string(bytes))
}
