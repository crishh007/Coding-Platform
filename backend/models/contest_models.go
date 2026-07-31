package models

import (
	"time"
)

// Contest represents a programming contest
type Contest struct {
	BaseModel   `bson:",inline"`
	Title       string           `bson:"title" json:"title"`
	Description string           `bson:"description" json:"description"`
	StartTime   time.Time        `bson:"startTime" json:"startTime"`
	EndTime     time.Time        `bson:"endTime" json:"endTime"`
	Duration    int              `bson:"duration" json:"duration"` // in minutes
	Status      string           `bson:"status" json:"status"`     // upcoming, active, ended
	Type        string           `bson:"type" json:"type"`         // Weekly, Biweekly, Special, Custom
	Difficulty  string           `bson:"difficulty" json:"difficulty"`
	MaxParticipants int          `bson:"maxParticipants" json:"maxParticipants"`
	CreatorID   string           `bson:"creatorId" json:"creatorId"`
	IsCustom    bool             `bson:"isCustom" json:"isCustom"`
	Problems    []ContestProblem `bson:"problems" json:"problems"`
}

// ContestProblem links a problem to a contest
type ContestProblem struct {
	ProblemID  string `bson:"problemId" json:"problemId"` // refers to Lesson ID / Practice Question ID
	Title      string `bson:"title" json:"title"`
	Difficulty string `bson:"difficulty" json:"difficulty"`
	Points     int    `bson:"points" json:"points"`
	Order      int    `bson:"order" json:"order"`
}

// Team represents a group of users
type Team struct {
	BaseModel   `bson:",inline"`
	Name        string       `bson:"name" json:"name"`
	Description string       `bson:"description" json:"description"`
	Avatar      string       `bson:"avatar" json:"avatar"`
	Members     []TeamMember `bson:"members" json:"members"`
	Stats       TeamStats    `bson:"stats" json:"stats"`
}

type TeamMember struct {
	UserID   string    `bson:"userId" json:"userId"`
	Role     string    `bson:"role" json:"role"` // admin, member
	JoinedAt time.Time `bson:"joinedAt" json:"joinedAt"`
}

type TeamStats struct {
	Rating       int `bson:"rating" json:"rating"`
	ContestsWon  int `bson:"contestsWon" json:"contestsWon"`
	ProblemsDone int `bson:"problemsDone" json:"problemsDone"`
}

// Violation represents an anti-cheat report
type Violation struct {
	BaseModel   `bson:",inline"`
	UserID      string `bson:"userId" json:"userId"`
	ContestID   string `bson:"contestId" json:"contestId"`
	Type        string `bson:"type" json:"type"` // plagiarism, ai-assist, multiple-ips
	Description string `bson:"description" json:"description"`
	Severity    string `bson:"severity" json:"severity"` // low, medium, high, critical
	Status      string `bson:"status" json:"status"`     // pending, investigated, resolved
	Evidence    string `bson:"evidence" json:"evidence"`
}

// ContestSubmission tracks problem attempts
type ContestSubmission struct {
	BaseModel `bson:",inline"`
	UserID    string `bson:"userId" json:"userId"`
	ContestID string `bson:"contestId" json:"contestId"`
	ProblemID string `bson:"problemId" json:"problemId"`
	Code      string `bson:"code" json:"code"`
	Language  string `bson:"language" json:"language"`
	Status    string `bson:"status" json:"status"` // pass, fail, compiling
	Score     int    `bson:"score" json:"score"`
}
