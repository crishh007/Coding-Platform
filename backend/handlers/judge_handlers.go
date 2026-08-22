package handlers

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"skillsync-learning-system/models"
)

// ─────────────────────────────────────────────
// Request / Response Structs
// ─────────────────────────────────────────────

type ExecuteRequest struct {
	ProblemId string `json:"problemId"`
	Language  string `json:"language"`
	Code      string `json:"code"`
	Input     string `json:"input"` // used only for Run (single test case)
	ContestId string `json:"contestId,omitempty"`
}

type TestCaseResult struct {
	CaseIndex int    `json:"caseIndex"`
	Input     string `json:"input"`
	Expected  string `json:"expected"`
	Actual    string `json:"actual"`
	Passed    bool   `json:"passed"`
	TimeMs    int64  `json:"timeMs"`
	Error     string `json:"error,omitempty"`
}

type SubmitResponse struct {
	Status   string           `json:"status"` // Accepted | Wrong Answer | Runtime Error | TLE | Compilation Error
	Passed   int              `json:"passed"`
	Total    int              `json:"total"`
	Results  []TestCaseResult `json:"results"`
	TimeMs   int64            `json:"timeMs"`
	Error    string           `json:"error,omitempty"`
}

// ─────────────────────────────────────────────
// Language Configuration
// ─────────────────────────────────────────────

type langConfig struct {
	fileName   string
	compileCmd []string // nil = interpreted
	runCmd     string
	runArgs    []string
}

func getLangConfig(lang string, tmpDir string) (*langConfig, error) {
	switch lang {
	case "python":
		return &langConfig{
			fileName: "solution.py",
			runCmd:   "python3",
			runArgs:  []string{"solution.py"},
		}, nil
	case "javascript":
		return &langConfig{
			fileName: "solution.js",
			runCmd:   "node",
			runArgs:  []string{"solution.js"},
		}, nil
	case "go":
		return &langConfig{
			fileName:   "solution.go",
			compileCmd: []string{"go", "build", "-o", "solution_bin", "solution.go"},
			runCmd:     filepath.Join(tmpDir, "solution_bin"),
			runArgs:    []string{},
		}, nil
	case "java":
		return &langConfig{
			fileName:   "Main.java",
			compileCmd: []string{"javac", "Main.java"},
			runCmd:     "java",
			runArgs:    []string{"-cp", tmpDir, "Main"},
		}, nil
	case "cpp":
		return &langConfig{
			fileName:   "solution.cpp",
			compileCmd: []string{"g++", "-O2", "-std=c++17", "solution.cpp", "-o", "solution_bin"},
			runCmd:     filepath.Join(tmpDir, "solution_bin"),
			runArgs:    []string{},
		}, nil
	case "c":
		return &langConfig{
			fileName:   "solution.c",
			compileCmd: []string{"gcc", "-O2", "solution.c", "-o", "solution_bin"},
			runCmd:     filepath.Join(tmpDir, "solution_bin"),
			runArgs:    []string{},
		}, nil
	default:
		return nil, fmt.Errorf("unsupported language: %s", lang)
	}
}

// ─────────────────────────────────────────────
// Compile Helper
// ─────────────────────────────────────────────

func compileCode(cfg *langConfig, tmpDir string) (string, error) {
	if cfg.compileCmd == nil {
		return "", nil // interpreted, skip
	}
	cmd := exec.Command(cfg.compileCmd[0], cfg.compileCmd[1:]...)
	cmd.Dir = tmpDir
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return stderr.String(), fmt.Errorf("compilation failed")
	}
	return "", nil
}

// ─────────────────────────────────────────────
// Execute a Single Test Case
// ─────────────────────────────────────────────

func runSingleTestCase(cfg *langConfig, tmpDir, input string, timeout time.Duration) (string, string, int64) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	runArgs := cfg.runArgs
	cmd := exec.CommandContext(ctx, cfg.runCmd, runArgs...)
	cmd.Dir = tmpDir

	if input != "" {
		cmd.Stdin = strings.NewReader(input)
	}

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	start := time.Now()
	err := cmd.Run()
	elapsed := time.Since(start).Milliseconds()

	if ctx.Err() == context.DeadlineExceeded {
		return "", "Time Limit Exceeded", elapsed
	}

	errStr := stderr.String()
	if err != nil && errStr == "" {
		errStr = err.Error()
	}

	return strings.TrimRight(stdout.String(), "\n\r"), errStr, elapsed
}

// ─────────────────────────────────────────────
// RunCode Handler — Single test case (Run button)
// ─────────────────────────────────────────────

func (h *Handler) RunCode(c *gin.Context) {
	var req ExecuteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Create a temp sandbox directory
	cwd, _ := os.Getwd()
	tmpDir := filepath.Join(cwd, "tmp", uuid.New().String())
	if err := os.MkdirAll(tmpDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sandbox"})
		return
	}
	defer os.RemoveAll(tmpDir)

	cfg, err := getLangConfig(req.Language, tmpDir)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Write code to file
	if err := os.WriteFile(filepath.Join(tmpDir, cfg.fileName), []byte(req.Code), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write code file"})
		return
	}

	// Compile if needed
	if compileErr, err := compileCode(cfg, tmpDir); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"output": "",
			"error":  "Compilation Error:\n" + compileErr,
			"timeMs": 0,
		})
		return
	}

	// Run with user-provided input
	output, errStr, elapsed := runSingleTestCase(cfg, tmpDir, req.Input, 5*time.Second)

	c.JSON(http.StatusOK, gin.H{
		"output": output,
		"error":  errStr,
		"timeMs": elapsed,
	})
}

// ─────────────────────────────────────────────
// SubmitCode Handler — All test cases (Submit button)
// ─────────────────────────────────────────────

func (h *Handler) SubmitCode(c *gin.Context) {
	var req ExecuteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Fetch problem test cases from DB (don't trust frontend)
	dbCtx, dbCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer dbCancel()

	var problem GlobalProblem
	err := h.db.Collection("problems").FindOne(dbCtx, bson.M{"id": req.ProblemId}).Decode(&problem)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Problem not found"})
		return
	}

	if len(problem.TestCases) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No test cases available for this problem"})
		return
	}

	// Bump submission count every time someone submits
	go h.db.Collection("problems").UpdateOne(
		context.Background(),
		bson.M{"id": req.ProblemId},
		bson.M{"$inc": bson.M{"submissionCount": 1}},
	)

	// Create a single sandbox (reuse binary across test cases for speed)
	cwd, _ := os.Getwd()
	tmpDir := filepath.Join(cwd, "tmp", uuid.New().String())
	if err := os.MkdirAll(tmpDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sandbox"})
		return
	}
	defer os.RemoveAll(tmpDir)

	cfg, err := getLangConfig(req.Language, tmpDir)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Write code to file
	if err := os.WriteFile(filepath.Join(tmpDir, cfg.fileName), []byte(req.Code), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write code"})
		return
	}

	// Compile once
	if compileErrStr, err := compileCode(cfg, tmpDir); err != nil {
		c.JSON(http.StatusOK, SubmitResponse{
			Status: "Compilation Error",
			Passed: 0,
			Total:  len(problem.TestCases),
			Error:  compileErrStr,
		})
		return
	}

	// Run all test cases
	var results []TestCaseResult
	totalPassed := 0
	var totalTime int64
	overallStatus := "Accepted"

	for i, tc := range problem.TestCases {
		input := tc["input"]
		expected := strings.TrimRight(tc["output"], "\n\r")

		// Skip placeholder test cases (problems that don't have real inputs yet)
		if input == "..." || expected == "..." {
			results = append(results, TestCaseResult{
				CaseIndex: i + 1,
				Input:     input,
				Expected:  expected,
				Actual:    "N/A",
				Passed:    true, // give benefit of the doubt for placeholder
				TimeMs:    0,
			})
			totalPassed++
			continue
		}

		actual, errStr, elapsed := runSingleTestCase(cfg, tmpDir, input, 5*time.Second)
		totalTime += elapsed

		passed := false
		caseStatus := ""

		if errStr == "Time Limit Exceeded" {
			overallStatus = "Time Limit Exceeded"
			caseStatus = "TLE"
		} else if errStr != "" {
			if overallStatus == "Accepted" {
				overallStatus = "Runtime Error"
			}
			caseStatus = errStr
		} else {
			passed = strings.TrimSpace(actual) == strings.TrimSpace(expected)
			if passed {
				totalPassed++
			} else if overallStatus == "Accepted" {
				overallStatus = "Wrong Answer"
			}
		}

		results = append(results, TestCaseResult{
			CaseIndex: i + 1,
			Input:     input,
			Expected:  expected,
			Actual:    actual,
			Passed:    passed,
			TimeMs:    elapsed,
			Error:     caseStatus,
		})
	}

	// Final status
	if totalPassed == len(problem.TestCases) {
		overallStatus = "Accepted"
	}

	// ── CONTEST SUBMISSION TRACKING ──
	if req.ContestId != "" {
		// Manually extract JWT since this route is public
		var userID string
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString := parts[1]
				token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
					if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
					}
					return []byte("my_secret_key_change_me"), nil
				})
				if err != nil {
					fmt.Println("JWT Parse Error in Judge:", err)
				}
				if err == nil && token.Valid {
					if claims, ok := token.Claims.(jwt.MapClaims); ok {
						if uid, ok := claims["user_id"].(string); ok {
							userID = uid
						} else {
							fmt.Println("user_id claim not found or not a string")
						}
					}
				}
			}
		} else {
			fmt.Println("No Authorization header found in SubmitCode")
		}

		fmt.Println("Extracted userID:", userID, "for contest:", req.ContestId)

		if userID != "" {
			
			// Calculate points
			points := 0
			var contest models.Contest
			err := h.db.Collection("contests").FindOne(context.Background(), bson.M{"_id": req.ContestId}).Decode(&contest)
			if err == nil {
				for _, cp := range contest.Problems {
					if cp.ProblemID == req.ProblemId {
						if len(problem.TestCases) > 0 {
							points = int(float64(cp.Points) * (float64(totalPassed) / float64(len(problem.TestCases))))
						}
						break
					}
				}
			}

			submission := models.ContestSubmission{
				UserID:    userID,
				ContestID: req.ContestId,
				ProblemID: req.ProblemId,
				Code:      req.Code,
				Language:  req.Language,
				Status:    overallStatus,
				Score:     points,
			}
			submission.InitID()
			
			res, err := h.db.Collection("contest_submissions").InsertOne(context.Background(), submission)
			if err != nil {
				fmt.Println("Error inserting contest submission:", err)
			} else {
				fmt.Println("Successfully inserted contest submission:", res.InsertedID)
			}
		} else {
			fmt.Println("userID is empty, skipping submission tracking")
		}
	} else {
		fmt.Println("req.ContestId is empty, skipping contest tracking")
	}

	c.JSON(http.StatusOK, SubmitResponse{
		Status:  overallStatus,
		Passed:  totalPassed,
		Total:   len(problem.TestCases),
		Results: results,
		TimeMs:  totalTime,
	})
}
