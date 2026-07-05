package handlers

import (
	"context"
	"net/http"

	"codemastery-learning-system/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Handler struct {
	db *mongo.Database
}

func NewHandler(db *mongo.Database) *Handler {
	return &Handler{db: db}
}

// GetTopicTree fetches all courses and their topics for the sidebar
func (h *Handler) GetTopicTree(c *gin.Context) {
	// 1. Fetch all courses
	courseCursor, _ := h.db.Collection("courses").Find(context.Background(), bson.M{})
	var courses []models.Course
	courseCursor.All(context.Background(), &courses)

	// 2. Fetch all topics
	topicCursor, _ := h.db.Collection("topics").Find(context.Background(), bson.M{})
	var topics []models.Topic
	topicCursor.All(context.Background(), &topics)
	topicMap := make(map[string]models.Topic)
	for _, t := range topics {
		topicMap[t.ID] = t
	}

	// 3. Build tree
	var tree []map[string]interface{}
	for _, course := range courses {
		courseNode := map[string]interface{}{
			"id":       course.ID,
			"title":    course.Title,
			"children": []map[string]interface{}{},
		}

		for _, ct := range course.Topics {
			topic, ok := topicMap[ct.TopicID]
			if !ok {
				continue
			}

			topicNode := map[string]interface{}{
				"id":       topic.ID,
				"title":    topic.Title,
				"children": []map[string]interface{}{},
			}

			for _, l := range topic.Lessons {
				lessonNode := map[string]interface{}{
					"id":    l.LessonID,
					"title": l.Title,
				}
				topicNode["children"] = append(topicNode["children"].([]map[string]interface{}), lessonNode)
			}

			courseNode["children"] = append(courseNode["children"].([]map[string]interface{}), topicNode)
		}

		tree = append(tree, courseNode)
	}

	c.JSON(http.StatusOK, tree)
}

func (h *Handler) GetTopicByID(c *gin.Context) {
	id := c.Param("id")
	var topic models.Topic
	err := h.db.Collection("topics").FindOne(context.Background(), bson.M{"_id": id}).Decode(&topic)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
		return
	}
	c.JSON(http.StatusOK, topic)
}

func (h *Handler) GetLessonByID(c *gin.Context) {
	id := c.Param("id")
	var lesson models.Lesson
	err := h.db.Collection("lessons").FindOne(context.Background(), bson.M{"_id": id}).Decode(&lesson)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lesson not found"})
		return
	}
	c.JSON(http.StatusOK, lesson)
}

type QuizSubmissionRequest struct {
	Answers []int `json:"answers"`
}

func (h *Handler) SubmitQuiz(c *gin.Context) {
	id := c.Param("id")

	var req QuizSubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	
	var lesson models.Lesson
	err := h.db.Collection("lessons").FindOne(context.Background(), bson.M{"_id": id}).Decode(&lesson)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lesson not found"})
		return
	}

	score := 0
	total := len(lesson.Quiz.Questions)
	
	for i, q := range lesson.Quiz.Questions {
		if i < len(req.Answers) && req.Answers[i] == q.Answer {
			score++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":         "submitted",
		"score":          score,
		"totalQuestions": total,
		"answers":        req.Answers,
	})
}

func (h *Handler) GetQuizSubmissions(c *gin.Context) {
	c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) SubmitPractice(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "passed", "feedback": "{}"})
}

func (h *Handler) GetPracticeSubmissions(c *gin.Context) {
	c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) MarkLessonCompleted(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "completed"})
}

func (h *Handler) MarkLessonIncomplete(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "incomplete"})
}

func (h *Handler) GetProgressStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"completedLessonIds": []string{}})
}

func (h *Handler) GetStreakStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"currentStreak": 1, "longestStreak": 1})
}

func (h *Handler) PingActivityStreak(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"currentStreak": 1, "longestStreak": 1})
}

func (h *Handler) GetCareerPaths(c *gin.Context) {
	cursor, err := h.db.Collection("career_paths").Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch career paths"})
		return
	}
	var paths []models.CareerPath
	if err = cursor.All(context.Background(), &paths); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode career paths"})
		return
	}
	c.JSON(http.StatusOK, paths)
}

func (h *Handler) GetCareerPathByID(c *gin.Context) {
	id := c.Param("id")
	var careerPath models.CareerPath
	err := h.db.Collection("career_paths").FindOne(context.Background(), bson.M{"_id": id}).Decode(&careerPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Career path not found"})
		return
	}

	// Also fetch the corresponding courses so frontend can draw the tree easily
	var courseIDs []string
	for _, pc := range careerPath.Courses {
		courseIDs = append(courseIDs, pc.CourseID)
	}

	cursor, err := h.db.Collection("courses").Find(context.Background(), bson.M{"_id": bson.M{"$in": courseIDs}})
	if err == nil {
		var courses []models.Course
		cursor.All(context.Background(), &courses)
		
		// Map course ID to Title
		courseMap := make(map[string]string)
		for _, c := range courses {
			courseMap[c.ID] = c.Title
		}

		// We will attach full course details to a custom response struct
		type ExpandedCourse struct {
			CourseID string `json:"id"`
			Title    string `json:"title"`
			Order    int    `json:"order"`
		}

		var expanded []ExpandedCourse
		for _, pc := range careerPath.Courses {
			expanded = append(expanded, ExpandedCourse{
				CourseID: pc.CourseID,
				Title:    courseMap[pc.CourseID],
				Order:    pc.Order,
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"id":          careerPath.ID,
			"title":       careerPath.Title,
			"description": careerPath.Description,
			"courses":     expanded,
		})
		return
	}

	c.JSON(http.StatusOK, careerPath)
}
