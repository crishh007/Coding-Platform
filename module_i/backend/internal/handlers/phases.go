package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"module_i_backend/internal/db"
	"module_i_backend/internal/models"
	"module_i_backend/internal/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// --- MOCK DATA SEEDER ---

func SeedMockData() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Seed System Design
	sdCollection := db.GetCollection("system_design_cases")
	sdCount, _ := sdCollection.CountDocuments(ctx, bson.M{})
	if sdCount == 0 {
		cases := []interface{}{
			models.SystemDesignCase{SystemName: "Design WhatsApp", Description: "High Level Design Case Study", Type: "HLD"},
			models.SystemDesignCase{SystemName: "Design Netflix", Description: "High Level Design Case Study", Type: "HLD"},
			models.SystemDesignCase{SystemName: "Design Uber", Description: "High Level Design Case Study", Type: "HLD"},
		}
		sdCollection.InsertMany(ctx, cases)
	}

	// Seed Fallback HR Questions
	hrCollection := db.GetCollection("fallback_hr_questions")
	hrCount, _ := hrCollection.CountDocuments(ctx, bson.M{})
	if hrCount == 0 {
		hrDocs := []interface{}{
			bson.M{"question": "Tell me about yourself and your professional journey."},
			bson.M{"question": "Where do you see yourself in 5 years?"},
			bson.M{"question": "What is your greatest strength and how has it helped you professionally?"},
			bson.M{"question": "What is your greatest weakness and what are you doing to improve it?"},
			bson.M{"question": "Describe a time you faced a significant challenge at work and how you overcame it."},
			bson.M{"question": "Tell me about a time you worked effectively under pressure or a tight deadline."},
			bson.M{"question": "Describe a situation where you had a conflict with a teammate. How did you resolve it?"},
			bson.M{"question": "Give an example of a goal you set and how you achieved it."},
			bson.M{"question": "Describe a time when you showed initiative and led an effort proactively."},
			bson.M{"question": "Tell me about a time you failed. What did you learn from it?"},
		}
		hrCollection.InsertMany(ctx, hrDocs)
	}

	// Seed Fallback Aptitude Questions
	aptCollection := db.GetCollection("fallback_aptitude_questions")
	aptCount, _ := aptCollection.CountDocuments(ctx, bson.M{})
	if aptCount == 0 {
		aptDocs := []interface{}{
			models.AptitudeQuestion{Question: "What is 15% of 80?", Options: []string{"10", "12", "14", "15"}, Answer: 1},
			models.AptitudeQuestion{Question: "If a train travels 60 miles in 1.5 hours, what is its speed?", Options: []string{"30 mph", "40 mph", "45 mph", "50 mph"}, Answer: 1},
			models.AptitudeQuestion{Question: "What comes next in the sequence: 2, 6, 12, 20, 30, ...?", Options: []string{"40", "42", "44", "46"}, Answer: 1},
			models.AptitudeQuestion{Question: "A shirt originally priced at $50 is discounted by 20%. What is the new price?", Options: []string{"$30", "$35", "$40", "$45"}, Answer: 2},
			models.AptitudeQuestion{Question: "Which word is an antonym for 'benevolent'?", Options: []string{"Kind", "Malevolent", "Generous", "Friendly"}, Answer: 1},
		}
		aptCollection.InsertMany(ctx, aptDocs)
	}
}

func fetchFallbackAptitudeQuestions() []models.AptitudeQuestion {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.GetCollection("fallback_aptitude_questions")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil
	}
	defer cursor.Close(ctx)

	var questions []models.AptitudeQuestion
	if err := cursor.All(ctx, &questions); err != nil || len(questions) == 0 {
		return nil
	}
	return questions
}

// --- Phase 5: Aptitude Handlers ---

func GenerateAptitudeTest(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	test := models.AptitudeTest{
		ID:       primitive.NewObjectID(),
		Duration: 60,
	}

	prompt := `Generate 5 multiple choice aptitude questions (math, logic, verbal reasoning).
Return ONLY a JSON array of objects, where each object has exactly these keys:
- "question": string
- "options": array of 4 string options
- "answer": integer index (0-3) of the correct option
Do not include markdown formatting or any other text.`

	resp, err := services.GenerateContent(prompt, "gemini-1.5-flash", -1)
	if err == nil {
		rawJSON := services.CleanGeminiResponse(resp)
		
		var qs []models.AptitudeQuestion
		if err := json.Unmarshal([]byte(rawJSON), &qs); err == nil {
			test.Questions = qs
		}
	}

	if len(test.Questions) == 0 {
		// Fallback if AI fails
		fallbackQs := fetchFallbackAptitudeQuestions()
		if fallbackQs != nil && len(fallbackQs) > 0 {
			test.Questions = fallbackQs
		} else {
			test.Questions = []models.AptitudeQuestion{
				{Question: "Fallback: What is 15% of 80?", Options: []string{"10", "12", "14", "15"}, Answer: 1},
			}
		}
	}

	_, _ = db.GetCollection("aptitude_tests").InsertOne(ctx, test)
	c.JSON(http.StatusOK, test)
}

func SubmitAptitudeTest(c *gin.Context) {
	var sub models.AptitudeSubmission
	if err := c.ShouldBindJSON(&sub); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Fetch original test to dynamically score it
	var test models.AptitudeTest
	testID, _ := primitive.ObjectIDFromHex(sub.TestID)
	err := db.GetCollection("aptitude_tests").FindOne(ctx, bson.M{"_id": testID}).Decode(&test)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to find original test"})
		return
	}

	score := 0
	total := len(test.Questions)
	
	for i, q := range test.Questions {
		// map[int]int matches option index to answer index
		if ans, ok := sub.Answers[i]; ok {
			if ans == q.Answer {
				score++
			}
		}
	}

	sub.ID = primitive.NewObjectID()
	sub.UserID = "anonymous"
	sub.Score = score
	sub.Total = total

	_, err = db.GetCollection("aptitude_submissions").InsertOne(ctx, sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert submission"})
		return
	}

	c.JSON(http.StatusOK, sub)
}

// --- Phase 6: System Design Handlers ---

func GetSystemDesignCases(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var cases []models.SystemDesignCase
	cursor, err := db.GetCollection("system_design_cases").Find(ctx, bson.M{})
	if err == nil {
		cursor.All(ctx, &cases)
	}
	if cases == nil {
		cases = []models.SystemDesignCase{}
	}
	c.JSON(http.StatusOK, cases)
}
