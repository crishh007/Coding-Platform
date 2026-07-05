package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"

	"module_i_backend/internal/db"
	"module_i_backend/internal/models"
	"module_i_backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/ledongthuc/pdf"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type QuestionResponse struct {
	Questions []string `json:"questions"`
}

type QAPair struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type EvaluateRequest struct {
	QAPairs []QAPair `json:"qaPairs"`
}

// defaultHRQuestions is a curated list of common HR behavioral questions
var defaultHRQuestions = []string{
	"Tell me about yourself and your professional journey.",
	"Where do you see yourself in 5 years?",
	"What is your greatest strength and how has it helped you professionally?",
	"What is your greatest weakness and what are you doing to improve it?",
	"Describe a time you faced a significant challenge at work and how you overcame it.",
	"Tell me about a time you worked effectively under pressure or a tight deadline.",
	"Describe a situation where you had a conflict with a teammate. How did you resolve it?",
	"Give an example of a goal you set and how you achieved it.",
	"Describe a time when you showed initiative and led an effort proactively.",
	"Tell me about a time you failed. What did you learn from it?",
	"How do you prioritize tasks when you have multiple competing deadlines?",
	"Describe a time when you had to adapt quickly to a major change.",
	"Give an example of when you went above and beyond your job responsibilities.",
	"Tell me about a time you had to persuade someone to see things your way.",
	"Why are you interested in this role and what makes you the best candidate?",
}

func fetchFallbackHRQuestions() []string {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	collection := db.GetCollection("fallback_hr_questions")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return defaultHRQuestions
	}
	defer cursor.Close(ctx)

	var docs []bson.M
	if err := cursor.All(ctx, &docs); err != nil {
		return defaultHRQuestions
	}

	var questions []string
	for _, doc := range docs {
		if q, ok := doc["question"].(string); ok {
			questions = append(questions, q)
		}
	}
	
	if len(questions) == 0 {
		return defaultHRQuestions
	}
	return questions
}

// GetDefaultQuestions returns a curated list of common HR interview questions
func GetDefaultQuestions(c *gin.Context) {
	c.JSON(http.StatusOK, QuestionResponse{Questions: fetchFallbackHRQuestions()})
}

func extractTextFromPDF(file multipart.File, size int64) (string, error) {
	reader, err := pdf.NewReader(file, size)
	if err != nil {
		return "", err
	}
	var textBuilder strings.Builder
	for pageIndex := 1; pageIndex <= reader.NumPage(); pageIndex++ {
		p := reader.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}
		text, err := p.GetPlainText(nil)
		if err != nil {
			return "", err
		}
		textBuilder.WriteString(text)
	}
	return textBuilder.String(), nil
}



// GenerateQuestions parses a resume and generates interview questions
func GenerateQuestions(c *gin.Context) {
	file, header, err := c.Request.FormFile("resume")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get resume file"})
		return
	}
	defer file.Close()

	var resumeText string
	if strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		resumeText, err = extractTextFromPDF(file, header.Size)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse PDF"})
			return
		}
	} else {
		buf := new(strings.Builder)
		io.Copy(buf, file)
		resumeText = buf.String()
	}

	if os.Getenv("GEMINI_API_KEY") == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GEMINI_API_KEY is not set"})
		return
	}

	prompt := fmt.Sprintf(`Based on the following resume, generate exactly 10 relevant behavioral HR interview questions tailored to the candidate's specific experience, projects, and skills.
Return ONLY a JSON array of strings, with no markdown formatting and no extra text.
Resume:
%s`, resumeText)

	responseText, err := services.GenerateContent(prompt, "gemini-2.5-flash", 0.7)
	if err != nil {
		fallbackQuestions := fetchFallbackHRQuestions()
		if len(fallbackQuestions) > 5 {
			fallbackQuestions = fallbackQuestions[:5]
		}
		c.JSON(http.StatusOK, QuestionResponse{Questions: fallbackQuestions})
		return
	}

	responseText = services.CleanGeminiResponse(responseText)

	var questions []string
	if err := json.Unmarshal([]byte(responseText), &questions); err != nil {
		fallbackQuestions := fetchFallbackHRQuestions()
		if len(fallbackQuestions) > 5 {
			fallbackQuestions = fallbackQuestions[:5]
		}
		c.JSON(http.StatusOK, QuestionResponse{Questions: fallbackQuestions})
		return
	}

	c.JSON(http.StatusOK, QuestionResponse{Questions: questions})
}

// EvaluateInterview evaluates the Q&A pairs
func EvaluateInterview(c *gin.Context) {
	var req EvaluateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if len(req.QAPairs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Q&A pairs provided"})
		return
	}

	if os.Getenv("GEMINI_API_KEY") == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GEMINI_API_KEY is not set"})
		return
	}

	qaText := ""
	for i, qa := range req.QAPairs {
		qaText += fmt.Sprintf("Q%d: %s\nA%d: %s\n\n", i+1, qa.Question, i+1, qa.Answer)
	}

	prompt := fmt.Sprintf(`You are an expert HR interview coach. Evaluate the following interview response(s) from a candidate.
Score each dimension out of 10 and provide actionable, specific feedback.
Return ONLY a JSON object matching this exact schema (no markdown, no extra text):
{
  "communicationScore": <int 1-10>,
  "confidenceScore": <int 1-10>,
  "technicalScore": <int 1-10>,
  "overallScore": <int 1-10>,
  "communicationFeedback": "<string>",
  "confidenceFeedback": "<string>",
  "technicalFeedback": "<string>",
  "overallFeedback": "<string>"
}

Interview Transcript:
%s`, qaText)

	responseText, err := services.GenerateContent(prompt, "gemini-2.5-flash", 0.7)
	if err != nil {
		fallbackEval := models.InterviewEvaluation{
			CommunicationScore: 7,
			ConfidenceScore:    7,
			TechnicalScore:     7,
			OverallScore:       7,
			CommunicationFeedback: "Good communication, but could be more concise. (Fallback generated)",
			ConfidenceFeedback:    "You sounded confident, keep it up. (Fallback generated)",
			TechnicalFeedback:     "Your technical points were mostly sound. (Fallback generated)",
			OverallFeedback:       "Solid performance overall, though AI evaluation is currently unavailable due to network issues.",
		}
		fallbackEval.ID = primitive.NewObjectID()
		fallbackEval.UserID = "anonymous"
		c.JSON(http.StatusOK, fallbackEval)
		return
	}

	responseText = services.CleanGeminiResponse(responseText)

	var evaluation models.InterviewEvaluation
	if err := json.Unmarshal([]byte(responseText), &evaluation); err != nil {
		fallbackEval := models.InterviewEvaluation{
			CommunicationScore: 7,
			ConfidenceScore:    7,
			TechnicalScore:     7,
			OverallScore:       7,
			CommunicationFeedback: "Good communication, but could be more concise. (Fallback generated)",
			ConfidenceFeedback:    "You sounded confident, keep it up. (Fallback generated)",
			TechnicalFeedback:     "Your technical points were mostly sound. (Fallback generated)",
			OverallFeedback:       "Solid performance overall, though AI evaluation is currently unavailable due to network issues.",
		}
		fallbackEval.ID = primitive.NewObjectID()
		fallbackEval.UserID = "anonymous"
		c.JSON(http.StatusOK, fallbackEval)
		return
	}

	evaluation.ID = primitive.NewObjectID()
	evaluation.UserID = "anonymous"

	dbCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, dbErr := db.GetCollection("interview_evaluations").InsertOne(dbCtx, evaluation)
	if dbErr != nil {
		// Non-fatal: log but return the evaluation anyway
		fmt.Printf("Warning: failed to save evaluation to DB: %v\n", dbErr)
	}

	c.JSON(http.StatusOK, evaluation)
}

// GetEvaluations retrieves all interview evaluations for the user
func GetEvaluations(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("interview_evaluations")
	// Since there is no auth, just fetch all for "anonymous" user, or just fetch all
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch evaluations"})
		return
	}
	defer cursor.Close(ctx)

	var evaluations []models.InterviewEvaluation
	if err = cursor.All(ctx, &evaluations); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode evaluations"})
		return
	}

	if evaluations == nil {
		evaluations = []models.InterviewEvaluation{}
	}

	c.JSON(http.StatusOK, evaluations)
}
