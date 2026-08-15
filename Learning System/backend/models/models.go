package models

import (
	"time"

	"github.com/google/uuid"
)

// BaseModel provides common fields for models
type BaseModel struct {
	ID        string    `bson:"_id" json:"id"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

func (b *BaseModel) InitID() {
	if b.ID == "" {
		b.ID = uuid.New().String()
		now := time.Now()
		b.CreatedAt = now
		b.UpdatedAt = now
	}
}

// User represents a system user and their login streak info
type User struct {
	BaseModel      `bson:",inline"`
	Email          string `bson:"email" json:"email"`
	Name           string `bson:"name" json:"name"`
	CurrentStreak  int    `bson:"currentStreak" json:"currentStreak"`
	LongestStreak  int    `bson:"longestStreak" json:"longestStreak"`
	LastActiveDate string `bson:"lastActiveDate" json:"lastActiveDate"`
}

// CareerPathCourse embeds course order inside a career path
type CareerPathCourse struct {
	CourseID string `bson:"courseId" json:"courseId"`
	Order    int    `bson:"order" json:"order"`
}

// CareerPath represents a top-level career trajectory
type CareerPath struct {
	BaseModel   `bson:",inline"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Courses     []CareerPathCourse `bson:"courses" json:"courses"`
}

// CourseTopic embeds topic order inside a course
type CourseTopic struct {
	TopicID string `bson:"topicId" json:"topicId"`
	Order   int    `bson:"order" json:"order"`
}

// Course (formerly LearningPath)
type Course struct {
	BaseModel `bson:",inline"`
	Title     string        `bson:"title" json:"title"`
	Topics    []CourseTopic `bson:"topics" json:"topics"`
}

// TopicLesson embeds lesson order inside a topic
type TopicLesson struct {
	LessonID string `bson:"lessonId" json:"lessonId"`
	Title    string `bson:"title" json:"title"`
	Order    int    `bson:"order" json:"order"`
}

// Topic represents a specific module/folder
type Topic struct {
	BaseModel `bson:",inline"`
	Title     string        `bson:"title" json:"title"`
	Lessons   []TopicLesson `bson:"lessons" json:"lessons"`
}

// LessonExplanation holds explanation metadata
type LessonExplanation struct {
	BriefOverview    string   `bson:"briefOverview" json:"briefOverview"`
	RealWorldAnalogy string   `bson:"realWorldAnalogy" json:"realWorldAnalogy"`
	KeySteps         []string `bson:"keySteps" json:"keySteps"`
	ProTip           string   `bson:"proTip" json:"proTip"`
}

// LessonVisualSimulation holds visualizer config
type PseudocodeLine struct {
	Line int    `bson:"line" json:"line"`
	Text string `bson:"text" json:"text"`
}

type LessonVisualSimulation struct {
	Type       string                 `bson:"type" json:"type"`
	Config     map[string]interface{} `bson:"config" json:"config"`
	Pseudocode []PseudocodeLine       `bson:"pseudocode,omitempty" json:"pseudocode,omitempty"`
}

// LessonSandbox holds starter code and test cases
type LessonSandbox struct {
	Languages map[string]string `bson:"languages" json:"languages"`
	TestCases []SandboxTestCase `bson:"testCases" json:"testCases"`
}

type SandboxTestCase struct {
	Input  string `bson:"input" json:"input"`
	Output string `bson:"output" json:"output"`
}

// LessonQuizQuestion holds quiz data
type LessonQuizQuestion struct {
	Question    string   `bson:"question" json:"question"`
	Options     []string `bson:"options" json:"options"`
	Answer      int      `bson:"answer" json:"answer"`
	Explanation string   `bson:"explanation,omitempty" json:"explanation,omitempty"`
}

type LessonQuiz struct {
	Questions []LessonQuizQuestion `bson:"questions" json:"questions"`
}

// PracticeTestCase represents a predefined test case for a practice problem
type PracticeTestCase struct {
	Input  string `bson:"input" json:"input"`
	Output string `bson:"output" json:"output"`
}

// PracticeQuestion represents a single coding challenge in the practice section
type PracticeQuestion struct {
	ID           string                 `bson:"id" json:"id"`
	ProblemTitle string                 `bson:"problemTitle" json:"problemTitle"`
	Description  string                 `bson:"description" json:"description"`
	StarterCode  map[string]interface{} `bson:"starterCode" json:"starterCode"`
	TestCases    []PracticeTestCase     `bson:"testCases" json:"testCases"`
}

// LessonPractice holds coding practice info
type LessonPractice struct {
	Questions []PracticeQuestion `bson:"questions" json:"questions"`
}

// Lesson represents a single instructional unit and all embedded content
type Lesson struct {
	BaseModel        `bson:",inline"`
	Title            string                 `bson:"title" json:"title"`
	Slug             string                 `bson:"slug" json:"slug"`
	Difficulty       string                 `bson:"difficulty" json:"difficulty"`
	EstimatedTime    int                    `bson:"estimatedTime" json:"estimatedTime"`
	Explanation      LessonExplanation      `bson:"explanation" json:"explanation"`
	VisualSimulation LessonVisualSimulation `bson:"visualSimulation" json:"visualSimulation"`
	Sandbox          LessonSandbox          `bson:"sandbox" json:"sandbox"`
	Quiz             LessonQuiz             `bson:"quiz" json:"quiz"`
	Practice         LessonPractice         `bson:"practice" json:"practice"`
}

// Progress tracks user completion for a specific lesson
type Progress struct {
	BaseModel            `bson:",inline"`
	UserID               string `bson:"userId" json:"userId"`
	LessonID             string `bson:"lessonId" json:"lessonId"`
	CompletedExplanation bool   `bson:"completedExplanation" json:"completedExplanation"`
	CompletedSimulation  bool   `bson:"completedSimulation" json:"completedSimulation"`
	CompletedQuiz        bool   `bson:"completedQuiz" json:"completedQuiz"`
	CompletedPractice    bool   `bson:"completedPractice" json:"completedPractice"`
	ProgressPercent      int    `bson:"progressPercent" json:"progressPercent"`
}

// QuizAttempt tracks history
type QuizAttempt struct {
	BaseModel `bson:",inline"`
	UserID    string `bson:"userId" json:"userId"`
	LessonID  string `bson:"lessonId" json:"lessonId"`
	Score     int    `bson:"score" json:"score"`
}

// Certificate represents an earned credential
type Certificate struct {
	BaseModel        `bson:",inline"`
	UserID           string    `bson:"userId" json:"userId"`
	CourseID         string    `bson:"courseId" json:"courseId"`
	Title            string    `bson:"title" json:"title"`
	RecipientName    string    `bson:"recipientName" json:"recipientName"`
	VerificationCode string    `bson:"verificationCode" json:"verificationCode"`
	EarnedAt         time.Time `bson:"earnedAt" json:"earnedAt"`
}
type TestCase struct {
	Input          string `json:"input" bson:"input"`
	ExpectedOutput string `json:"expected_output" bson:"expected_output"`
	IsHidden       bool   `json:"is_hidden" bson:"is_hidden"`
}

type Problem struct {
	ID          any        `json:"_id,omitempty" bson:"_id,omitempty"`
	ProblemID   int        `json:"id" bson:"id"`
	Title       string     `json:"title" bson:"title"`
	Difficulty  string     `json:"difficulty" bson:"difficulty"`
	Acceptance  string     `json:"acceptance" bson:"acceptance"`
	Description string     `json:"description" bson:"description"`
	Examples    []string   `json:"examples" bson:"examples"`
	Topics      []string   `json:"topics" bson:"topics"`
	Likes       int        `json:"likes" bson:"likes"`
	Dislikes    int        `json:"dislikes" bson:"dislikes"`
	TestCases   []TestCase `json:"testCases" bson:"testCases"`
}
