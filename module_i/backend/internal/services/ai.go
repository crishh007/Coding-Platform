package services

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// CleanGeminiResponse strips markdown code fences from Gemini output
func CleanGeminiResponse(text string) string {
	text = strings.TrimSpace(text)
	if strings.HasPrefix(text, "```json") {
		text = strings.TrimPrefix(text, "```json")
	} else if strings.HasPrefix(text, "```") {
		text = strings.TrimPrefix(text, "```")
	}
	if strings.HasSuffix(text, "```") {
		text = strings.TrimSuffix(text, "```")
	}
	return strings.TrimSpace(text)
}

// GenerateContent interacts with Gemini to generate content based on a prompt.
func GenerateContent(prompt string, modelName string, temperature float32) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}
	defer client.Close()

	if modelName == "" {
		modelName = "gemini-2.5-flash"
	}

	model := client.GenerativeModel(modelName)
	if temperature >= 0 {
		model.SetTemperature(temperature)
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty response from Gemini")
	}

	if part, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
		return string(part), nil
	}

	return "", fmt.Errorf("failed to parse Gemini response part")
}
