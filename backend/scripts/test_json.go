package main

import (
	"encoding/json"
	"fmt"
	"codemastery-learning-system/models"
	"time"
)

func main() {
	c := models.Contest{}
	c.ID = "12345"
	c.CreatedAt = time.Now()
	
	bytes, _ := json.Marshal(c)
	fmt.Println(string(bytes))
}
