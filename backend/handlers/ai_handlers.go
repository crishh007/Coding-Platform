package handlers

import (
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message"`
	Context string `json:"context"` // e.g. "Arrays 101"
}

func (h *Handler) ChatWithAI(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Simulated AI Delay
	time.Sleep(1500 * time.Millisecond)

	msg := strings.ToLower(req.Message)
	var response string

	// Simulated smart responses
	if strings.Contains(msg, "array") {
		response = "Arrays are a foundational data structure! They store elements in contiguous memory locations, which makes accessing any element by its index extremely fast (O(1) time complexity)."
	} else if strings.Contains(msg, "big o") || strings.Contains(msg, "complexity") {
		response = "Big O notation describes the worst-case time or space complexity of an algorithm. O(1) is constant, O(N) is linear, and O(N^2) is quadratic. Which one would you like to know more about?"
	} else if strings.Contains(msg, "hello") || strings.Contains(msg, "hi") {
		response = "Hello there! I'm your CodeMastery AI Assistant. I see you're currently learning about '" + req.Context + "'. How can I help you today?"
	} else if strings.Contains(msg, "thank") {
		response = "You're very welcome! Keep up the great work on your coding journey."
	} else {
		responses := []string{
			"That's a great question! In programming, it often depends on the specific language you're using, but generally, you want to prioritize readable and maintainable code.",
			"Interesting thought. When dealing with that kind of problem, you might want to consider using a HashMap for O(1) lookups.",
			"I'm a simulated AI for now, but if I were connected to OpenAI, I'd write you a 5-paragraph essay on that!",
			"Can you clarify what you mean? Are you asking about the syntax or the underlying algorithm?",
		}
		response = responses[rand.Intn(len(responses))]
	}

	c.JSON(http.StatusOK, gin.H{"response": response})
}
