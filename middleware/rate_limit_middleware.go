package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// bucket is a simple sliding-window token bucket per key.
type bucket struct {
	mu       sync.Mutex
	tokens   float64
	maxTokens float64
	refillRate float64 // tokens per second
	lastRefill time.Time
}

func newBucket(max float64, refillPerSecond float64) *bucket {
	return &bucket{
		tokens:     max,
		maxTokens:  max,
		refillRate: refillPerSecond,
		lastRefill: time.Now(),
	}
}

func (b *bucket) allow() bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := time.Now()
	elapsed := now.Sub(b.lastRefill).Seconds()
	b.tokens += elapsed * b.refillRate
	if b.tokens > b.maxTokens {
		b.tokens = b.maxTokens
	}
	b.lastRefill = now
	if b.tokens >= 1 {
		b.tokens--
		return true
	}
	return false
}

// store holds per-IP buckets; a background goroutine cleans stale entries.
type store struct {
	mu      sync.Mutex
	buckets map[string]*bucket
	max     float64
	refill  float64
}

func newStore(max, refill float64) *store {
	s := &store{buckets: make(map[string]*bucket), max: max, refill: refill}
	go s.cleanup()
	return s
}

func (s *store) get(key string) *bucket {
	s.mu.Lock()
	defer s.mu.Unlock()
	if b, ok := s.buckets[key]; ok {
		return b
	}
	b := newBucket(s.max, s.refill)
	s.buckets[key] = b
	return b
}

func (s *store) cleanup() {
	for range time.Tick(10 * time.Minute) {
		s.mu.Lock()
		for k, b := range s.buckets {
			b.mu.Lock()
			idle := time.Since(b.lastRefill) > 15*time.Minute
			b.mu.Unlock()
			if idle {
				delete(s.buckets, k)
			}
		}
		s.mu.Unlock()
	}
}

// RateLimiter returns a middleware that limits to max burst, refilling at
// refillPerSecond tokens/second, keyed by client IP.
//
// Usage:
//
//	// 5 requests burst, 1 per 20 s steady state
//	router.POST("/login", middleware.RateLimiter(5, 0.05), controllers.Login)
func RateLimiter(maxBurst float64, refillPerSecond float64) gin.HandlerFunc {
	s := newStore(maxBurst, refillPerSecond)
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !s.get(ip).allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
