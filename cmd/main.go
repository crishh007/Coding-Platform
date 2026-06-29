package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"auth-service-go/config"
	"auth-service-go/database"
	"auth-service-go/models"
	"auth-service-go/routes"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "auth-service-go/docs"
)

// @title           Auth Service API
// @version         1.0
// @description     Authentication and User Management Service
// @host            localhost:8000
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in              header
// @name            Authorization
func main() {
	config.LoadEnv()
	database.ConnectDatabase()

	// Auto-migrate — in production prefer explicit migration files (golang-migrate)
	if err := database.DB.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("[migrate] failed: %v", err)
	}

	// Use gin.New() — never gin.Default() in production.
	// gin.Default() attaches a recovery middleware that writes stack traces to the
	// response body. We attach our own recovery that returns only a generic 500.
	router := gin.New()
	router.Use(gin.Recovery()) // panic → 500, no internals leaked
	router.Use(structuredLogger())

	// CORS — restrict to your actual frontend origin(s) in production
	router.Use(corsMiddleware())

	// Health check — used by load balancers and Kubernetes liveness probes
	router.GET("/healthz", func(c *gin.Context) {
		sqlDB, err := database.DB.DB()
		if err != nil || sqlDB.Ping() != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "db_unreachable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Auth Service Running"})
	})

	routes.AuthRoutes(router)

	// Swagger — only exposed in non-production environments
	if os.Getenv("APP_ENV") != "production" {
		router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		log.Println("[swagger] UI available at /swagger/index.html")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown — drains in-flight requests before exiting
	go func() {
		log.Printf("[server] listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[server] fatal: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[server] shutting down gracefully…")
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[server] forced shutdown: %v", err)
	}
	log.Println("[server] stopped")
}

// structuredLogger returns a minimal JSON-ish request logger.
// Replace with zerolog/zap in a real service.
func structuredLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// Skip logging 200 health checks to reduce noise
		if param.Path == "/healthz" && param.StatusCode == 200 {
			return ""
		}
		return `{"time":"` + param.TimeStamp.UTC().Format(time.RFC3339) +
			`","status":` + statusStr(param.StatusCode) +
			`,"method":"` + param.Method +
			`","path":"` + param.Path +
			`","latency":"` + param.Latency.String() +
			`","ip":"` + param.ClientIP + `"}` + "\n"
	})
}

func statusStr(code int) string {
	s := ""
	switch {
	case code < 300:
		s = "2xx"
	case code < 400:
		s = "3xx"
	case code < 500:
		s = "4xx"
	default:
		s = "5xx"
	}
	_ = s
	// Return the actual numeric value for log analysis
	return http.StatusText(code)[:0] + itoa(code)
}

func itoa(i int) string {
	return http.StatusText(i)[:0] + string(rune('0'+i/100)) +
		string(rune('0'+(i/10)%10)) +
		string(rune('0'+i%10))
}

// corsMiddleware sets conservative CORS headers.
// In production, replace allowedOrigins with your actual frontend domain(s).
func corsMiddleware() gin.HandlerFunc {
	allowedOrigin := os.Getenv("CORS_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000" // safe dev default
	}
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Max-Age", "86400")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
