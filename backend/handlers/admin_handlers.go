package handlers

import (
	"context"
	"net/http"

	"skillsync-learning-system/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// AdminCreateCourse creates a new course
func (h *Handler) AdminCreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	course.InitID()
	if course.Topics == nil {
		course.Topics = []models.CourseTopic{}
	}
	
	_, err := h.db.Collection("courses").InsertOne(context.Background(), course)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}
	c.JSON(http.StatusOK, course)
}

// AdminCreateTopic creates a new topic and links it to a course
func (h *Handler) AdminCreateTopic(c *gin.Context) {
	var req struct {
		CourseID string `json:"courseId"`
		Title    string `json:"title"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	topic := models.Topic{
		Title:   req.Title,
		Lessons: []models.TopicLesson{},
	}
	topic.InitID()

	_, err := h.db.Collection("topics").InsertOne(context.Background(), topic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create topic"})
		return
	}

	// Link topic to course
	update := bson.M{
		"$push": bson.M{
			"topics": models.CourseTopic{
				TopicID: topic.ID,
				Order:   0,
			},
		},
	}
	_, err = h.db.Collection("courses").UpdateOne(context.Background(), bson.M{"_id": req.CourseID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link topic to course"})
		return
	}

	c.JSON(http.StatusOK, topic)
}

// AdminCreateLesson creates a new lesson and links it to a topic
func (h *Handler) AdminCreateLesson(c *gin.Context) {
	var req struct {
		TopicID string        `json:"topicId"`
		Lesson  models.Lesson `json:"lesson"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lesson := req.Lesson
	lesson.InitID()

	_, err := h.db.Collection("lessons").InsertOne(context.Background(), lesson)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create lesson"})
		return
	}

	// Link lesson to topic
	update := bson.M{
		"$push": bson.M{
			"lessons": models.TopicLesson{
				LessonID: lesson.ID,
				Title:    lesson.Title,
				Order:    0,
			},
		},
	}
	_, err = h.db.Collection("topics").UpdateOne(context.Background(), bson.M{"_id": req.TopicID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link lesson to topic"})
		return
	}

	c.JSON(http.StatusOK, lesson)
}
