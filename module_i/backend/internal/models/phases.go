package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// --- Phase 5: Aptitude Models ---

type AptitudeModule struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Icon        string `json:"icon"` // identifier for icon
}

type AptitudeTest struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Duration  int                `json:"duration"` // in minutes
	Questions []AptitudeQuestion `json:"questions"`
}

type AptitudeQuestion struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
	Answer   int      `json:"answer"` // index of correct option
}

type AptitudeSubmission struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `bson:"userId" json:"userId"`
	TestID    string             `bson:"testId" json:"testId"`
	Answers   map[int]int        `bson:"answers" json:"answers"`
	Score     int                `bson:"score" json:"score"`
	Total     int                `bson:"total" json:"total"`
}

// --- Phase 2: Mock Interview Models ---

type InterviewEvaluation struct {
	ID                    primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID                string             `bson:"userId" json:"userId"`
	CommunicationScore    int                `bson:"communicationScore" json:"communicationScore"`
	ConfidenceScore       int                `bson:"confidenceScore" json:"confidenceScore"`
	TechnicalScore        int                `bson:"technicalScore" json:"technicalScore"`
	OverallScore          int                `bson:"overallScore" json:"overallScore"`
	CommunicationFeedback string             `bson:"communicationFeedback" json:"communicationFeedback"`
	ConfidenceFeedback    string             `bson:"confidenceFeedback" json:"confidenceFeedback"`
	TechnicalFeedback     string             `bson:"technicalFeedback" json:"technicalFeedback"`
	OverallFeedback       string             `bson:"overallFeedback" json:"overallFeedback"`
}

// --- Phase 6: System Design Models ---

type SystemDesignCase struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SystemName  string             `bson:"systemName" json:"systemName"`
	Description string             `bson:"description" json:"description"`
	Type        string             `bson:"type" json:"type"`
}
