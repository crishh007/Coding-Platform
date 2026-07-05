package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"module_i_backend/internal/db"
	"module_i_backend/internal/models"
	"module_i_backend/internal/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)


func getResumeCollection() *mongo.Collection {
	return db.GetCollection("resumes")
}

// GetResumes retrieves all resumes
func GetResumes(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := getResumeCollection()
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch resumes"})
		return
	}
	defer cursor.Close(ctx)

	var resumes []models.Resume
	if err = cursor.All(ctx, &resumes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode resumes"})
		return
	}

	if resumes == nil {
		resumes = []models.Resume{}
	}

	c.JSON(http.StatusOK, gin.H{"data": resumes})
}

// CreateResume creates a new resume
func CreateResume(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var resume models.Resume
	if err := c.ShouldBindJSON(&resume); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resume.ID = primitive.NewObjectID()
	resume.CreatedAt = time.Now()
	resume.UpdatedAt = time.Now()

	collection := getResumeCollection()
	result, err := collection.InsertOne(ctx, resume)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create resume"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Resume created successfully", "id": result.InsertedID})
}

// GetResume retrieves a single resume by ID
func GetResume(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
		return
	}

	var resume models.Resume
	collection := getResumeCollection()
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&resume)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch resume"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": resume})
}

// UpdateResume updates an existing resume
func UpdateResume(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
		return
	}

	var updateData models.Resume
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateData.UpdatedAt = time.Now()

	// Use UpdateOne with $set to partially update the document, preserving _id and potentially other fields
	collection := getResumeCollection()
	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update resume: " + err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resume updated successfully", "modifiedCount": result.ModifiedCount})
}

// DeleteResume deletes a resume by ID
func DeleteResume(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
		return
	}

	collection := getResumeCollection()
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete resume"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resume deleted successfully"})
}

// PreviewResume mock handler
func PreviewResume(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Preview generated"})
}

// CalculateATSScore mock handler
func CalculateATSScore(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"score": 85, "message": "Calculated successfully"})
}

type EnhanceRequest struct {
	Text string `json:"text"`
}

func EnhanceBullet(c *gin.Context) {
	var req EnhanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	prompt := fmt.Sprintf(`Rewrite the following resume bullet point to be more professional, use strong action verbs, and highlight metrics if possible. Return ONLY the rewritten text, with no markdown formatting or extra text.
Bullet point: %s`, req.Text)

	responseText, err := services.GenerateContent(prompt, "gemini-2.5-flash", -1)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"enhanced_text": req.Text + " (AI unavailable to enhance)"})
		return
	}

	responseText = strings.TrimSpace(responseText)
	c.JSON(http.StatusOK, gin.H{"enhanced_text": responseText})
}

func ParsePDF(c *gin.Context) {
	file, header, err := c.Request.FormFile("resume")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get resume file"})
		return
	}
	defer file.Close()

	if !strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF files are supported"})
		return
	}

	resumeText, err := extractTextFromPDF(file, header.Size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse PDF"})
		return
	}

	prompt := fmt.Sprintf(`Parse the following resume text and map it to this JSON structure. Ensure the output is strictly valid JSON with no markdown block formatting (like %s).
Structure:
{
  "personal_info": {"full_name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""},
  "education": [{"institution": "", "degree": "", "field_of_study": "", "start_date": "", "end_date": "", "score": "", "score_type": "CGPA", "location": ""}],
  "experience": [{"company": "", "title": "", "location": "", "start_date": "", "end_date": "", "description": [""]}],
  "projects": [{"name": "", "technologies": [""], "description": [""], "link": "", "live_link": "", "duration": ""}],
  "technical_skills": {"languages": [""], "frameworks": [""], "databases": [""], "developer_tools": [""], "platforms": [""], "other": [""]}
}

Resume Text:
%s`, "```json", resumeText)

	responseText, err := services.GenerateContent(prompt, "gemini-2.5-flash", -1)
	if err != nil {
		fallbackData := map[string]interface{}{
			"personal_info": map[string]string{"full_name": "Fallback User (AI Unavailable)"},
			"education": []map[string]string{},
			"experience": []map[string]string{},
			"projects": []map[string]string{},
			"technical_skills": map[string]interface{}{},
		}
		c.JSON(http.StatusOK, gin.H{"data": fallbackData})
		return
	}

	responseText = services.CleanGeminiResponse(responseText)

	var parsedData map[string]interface{}
	if err := json.Unmarshal([]byte(responseText), &parsedData); err != nil {
		fallbackData := map[string]interface{}{
			"personal_info": map[string]string{"full_name": "Fallback User (AI Unavailable)"},
			"education": []map[string]string{},
			"experience": []map[string]string{},
			"projects": []map[string]string{},
			"technical_skills": map[string]interface{}{},
		}
		c.JSON(http.StatusOK, gin.H{"data": fallbackData})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": parsedData})
}
