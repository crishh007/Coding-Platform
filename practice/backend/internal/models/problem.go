package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TestCase struct {
	Input          string `json:"input" bson:"input"`
	ExpectedOutput string `json:"expected_output" bson:"expected_output"`
	IsHidden       bool   `json:"is_hidden" bson:"is_hidden"`
}

type Problem struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	ProblemID   int                `json:"id" bson:"id"` // Sequential ID like LeetCode
	Title       string             `json:"title" bson:"title"`
	Difficulty  string             `json:"difficulty" bson:"difficulty"`
	Acceptance  string             `json:"acceptance" bson:"acceptance"`
	Description string             `json:"description" bson:"description"`
	Examples    []string           `json:"examples" bson:"examples"`
	Topics      []string           `json:"topics" bson:"topics"`
	Likes       int                `json:"likes" bson:"likes"`
	Dislikes    int                `json:"dislikes" bson:"dislikes"`
	TestCases   []TestCase         `json:"testCases" bson:"testCases"`
}
