package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
)

// Legacy structures from the flat file
type LegacyLesson struct {
	Title            string             `json:"title"`
	Slug             string             `json:"slug"`
	Description      string             `json:"description"`
	LessonType       string             `json:"lessonType"`
	EstimatedMinutes int                `json:"estimatedMinutes"`
	Metadata         map[string]string  `json:"metadata"`
	Placeholders     []LegacyPlaceholder `json:"placeholders"`
}

type LegacyPlaceholder struct {
	PlaceholderType string      `json:"placeholderType"`
	Status          string      `json:"status"`
	Metadata        interface{} `json:"metadata"`
}

type LegacyTopic struct {
	Title            string        `json:"title"`
	Slug             string        `json:"slug"`
	Description      string        `json:"description"`
	DifficultyLevel  string        `json:"difficultyLevel"`
	EstimatedMinutes int           `json:"estimatedMinutes"`
	IconURL          string        `json:"iconUrl"`
	Prerequisites    []string      `json:"prerequisites"`
	Lessons          []LegacyLesson `json:"lessons"`
	Children         []LegacyTopic  `json:"children"`
}

type LegacyCourse struct {
	Title                 string        `json:"title"`
	Slug                  string        `json:"slug"`
	Description           string        `json:"description"`
	DifficultyLevel       string        `json:"difficultyLevel"`
	IconURL               string        `json:"iconUrl"`
	TotalEstimatedMinutes int           `json:"totalEstimatedMinutes"`
	Topics                []LegacyTopic `json:"topics"`
}

type LegacyCareer struct {
	Title       string         `json:"title"`
	Slug        string         `json:"slug"`
	Description string         `json:"description"`
	IconURL     string         `json:"iconUrl"`
	Courses     []LegacyCourse `json:"courses"`
}

// New structures for topics.json
type NewTopic struct {
	Title            string     `json:"title"`
	Slug             string     `json:"slug"`
	Description      string     `json:"description"`
	DifficultyLevel  string     `json:"difficultyLevel"`
	EstimatedMinutes int        `json:"estimatedMinutes"`
	IconURL          string     `json:"iconUrl"`
	Prerequisites    []string   `json:"prerequisites,omitempty"`
	LessonSlugs      []string   `json:"lessons,omitempty"`
	Children         []NewTopic `json:"children,omitempty"`
}

func main() {
	bytes, err := os.ReadFile("data/curriculum/backend-developer.json")
	if err != nil {
		log.Fatal(err)
	}

	var career LegacyCareer
	if err := json.Unmarshal(bytes, &career); err != nil {
		log.Fatal(err)
	}

	careerDir := filepath.Join("data", "curriculum", career.Slug)
	os.MkdirAll(careerDir, 0755)

	// Write career.json
	careerData := map[string]string{
		"title":       career.Title,
		"slug":        career.Slug,
		"description": career.Description,
		"iconUrl":     career.IconURL,
	}
	writeJSON(filepath.Join(careerDir, "career.json"), careerData)

	// Courses
	for _, course := range career.Courses {
		courseDir := filepath.Join(careerDir, "courses", course.Slug)
		os.MkdirAll(courseDir, 0755)

		courseData := map[string]interface{}{
			"title":                 course.Title,
			"slug":                  course.Slug,
			"description":           course.Description,
			"difficultyLevel":       course.DifficultyLevel,
			"iconUrl":               course.IconURL,
			"totalEstimatedMinutes": course.TotalEstimatedMinutes,
		}
		writeJSON(filepath.Join(courseDir, "course.json"), courseData)

		var newTopics []NewTopic
		for _, topic := range course.Topics {
			newTopics = append(newTopics, processTopic(topic, filepath.Join(courseDir, "lessons")))
		}
		writeJSON(filepath.Join(courseDir, "topics.json"), newTopics)
	}

	log.Println("Successfully shattered JSON into folder tree!")
}

func processTopic(topic LegacyTopic, lessonsDir string) NewTopic {
	newT := NewTopic{
		Title:            topic.Title,
		Slug:             topic.Slug,
		Description:      topic.Description,
		DifficultyLevel:  topic.DifficultyLevel,
		EstimatedMinutes: topic.EstimatedMinutes,
		IconURL:          topic.IconURL,
		Prerequisites:    topic.Prerequisites,
	}

	for _, lesson := range topic.Lessons {
		newT.LessonSlugs = append(newT.LessonSlugs, lesson.Slug)

		lessonDir := filepath.Join(lessonsDir, lesson.Slug)
		os.MkdirAll(lessonDir, 0755)

		// write lesson.json
		lData := map[string]interface{}{
			"title":            lesson.Title,
			"slug":             lesson.Slug,
			"description":      lesson.Description,
			"lessonType":       lesson.LessonType,
			"estimatedMinutes": lesson.EstimatedMinutes,
			"metadata":         lesson.Metadata,
		}
		writeJSON(filepath.Join(lessonDir, "lesson.json"), lData)

		// Write placeholders
		for _, ph := range lesson.Placeholders {
			// file name based on placeholder type (e.g. quiz.json)
			fname := fmt.Sprintf("%s.json", ph.PlaceholderType)
			writeJSON(filepath.Join(lessonDir, fname), ph)
		}
	}

	for _, child := range topic.Children {
		newT.Children = append(newT.Children, processTopic(child, lessonsDir))
	}

	return newT
}

func writeJSON(path string, data interface{}) {
	b, _ := json.MarshalIndent(data, "", "  ")
	err := os.WriteFile(path, b, 0644)
	if err != nil {
		log.Fatalf("Failed writing %s: %v", path, err)
	}
}
