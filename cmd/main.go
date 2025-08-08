package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"anonlink/internal/auth"
	"anonlink/internal/config"
	"anonlink/internal/database"
	"anonlink/internal/files"
	"anonlink/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	
	cfg := config.Load()

	
	db, err := database.Init(cfg.DatabasePath)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	
	if err := os.MkdirAll(cfg.UploadsPath, 0755); err != nil {
		log.Fatal("Failed to create uploads directory:", err)
	}

	
	authService := auth.NewService(db, cfg.JWTSecret)
	fileService := files.NewService(db, cfg.UploadsPath)

	
	h := handlers.New(authService, fileService)

	
	go func() {
		ticker := time.NewTicker(1 * time.Hour) 
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				if err := fileService.CleanupExpiredFiles(); err != nil {
					log.Printf("Error cleaning up expired files: %v", err)
				}
			}
		}
	}()

	
	go func() {
		time.Sleep(10 * time.Second) 
		if err := fileService.CleanupExpiredFiles(); err != nil {
			log.Printf("Error in initial cleanup: %v", err)
		}
	}()

	
	r := gin.Default()

	
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	
	api := r.Group("/api/v1")
	{
		
		api.POST("/register", h.Register)
		api.POST("/login", h.Login)

		
		protected := api.Group("/")
		protected.Use(h.AuthMiddleware())
		{
			
			protected.POST("/upload", h.UploadFile)
			protected.GET("/files", h.GetUserFiles)
			protected.DELETE("/files/:id", h.DeleteFile)
			protected.GET("/files/:id/download", h.DownloadFile)
			protected.POST("/files/:id/regenerate-link", h.GenerateNewShareLink)
		}

		
		api.GET("/download/:token", h.PublicDownload)
		api.GET("/file-info/:token", h.GetFileInfo)
	}

	
	r.Static("/static", "./frontend/build/static")
	r.StaticFile("/", "./frontend/build/index.html")
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/build/index.html")
	})

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(r.Run(":" + cfg.Port))
}
