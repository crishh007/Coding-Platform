package handlers

import (
	"net/http"
	"strings"

	"module_i_backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Message string `json:"message"`
}

type CodingChatRequest struct {
	History []ChatMessage `json:"history"`
	Code    string        `json:"code"`
}

func CodingInterviewChat(c *gin.Context) {
	var req CodingChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}



	// Build prompt
	var promptBuilder strings.Builder
	promptBuilder.WriteString("You are a strict but helpful FAANG technical interviewer. Your goal is to evaluate the candidate's coding skills. ")
	promptBuilder.WriteString("Provide hints if they are stuck, ask about time/space complexity, and point out edge cases. Keep your responses concise and conversational (do not output a huge essay).\n\n")

	promptBuilder.WriteString("Conversation History:\n")
	for _, msg := range req.History {
		if msg.Role == "user" {
			promptBuilder.WriteString("Candidate: " + msg.Message + "\n")
		} else {
			promptBuilder.WriteString("Interviewer: " + msg.Message + "\n")
		}
	}

	promptBuilder.WriteString("\nCandidate's Current Code:\n```\n")
	if req.Code == "" {
		promptBuilder.WriteString("(Empty)\n")
	} else {
		promptBuilder.WriteString(req.Code + "\n")
	}
	promptBuilder.WriteString("```\n\n")
	promptBuilder.WriteString("Interviewer (your next response):")

	resp, err := services.GenerateContent(promptBuilder.String(), "gemini-2.5-flash", 0.7)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"reply": "I'm experiencing some network issues right now. Could you walk me through the time and space complexity of your approach?"})
		return
	}

	replyText := resp

	c.JSON(http.StatusOK, gin.H{"reply": strings.TrimSpace(replyText)})
}

