package handlers

import (
	"net/http"
	"strings"

	"anonlink/internal/auth"
	"anonlink/internal/files"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
	authService *auth.Service
	fileService *files.Service
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func New(authService *auth.Service, fileService *files.Service) *Handlers {
	return &Handlers{
		authService: authService,
		fileService: fileService,
	}
}

func (h *Handlers) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	user, err := h.authService.Register(req.Username, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   "Failed to create user: " + err.Error(),
		})
		return
	}

	token, err := h.authService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: "User created successfully",
		Data: gin.H{
			"user":  user,
			"token": token,
		},
	})
}

func (h *Handlers) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	user, token, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error:   "Invalid credentials",
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "Login successful",
		Data: gin.H{
			"user":  user,
			"token": token,
		},
	})
}

func (h *Handlers) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, Response{
				Success: false,
				Error:   "Authorization header required",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, Response{
				Success: false,
				Error:   "Invalid authorization format",
			})
			c.Abort()
			return
		}

		claims, err := h.authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, Response{
				Success: false,
				Error:   "Invalid token",
			})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

func (h *Handlers) UploadFile(c *gin.Context) {
	userID := c.GetInt("userID")

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   "No file uploaded",
		})
		return
	}

	
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   "File too large (max 10MB)",
		})
		return
	}

	uploadedFile, err := h.fileService.UploadFile(userID, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Error:   "Failed to upload file: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "File uploaded successfully",
		Data:    uploadedFile,
	})
}

func (h *Handlers) GetUserFiles(c *gin.Context) {
	userID := c.GetInt("userID")

	files, err := h.fileService.GetUserFiles(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Error:   "Failed to get files: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    files,
	})
}

func (h *Handlers) DeleteFile(c *gin.Context) {
	userID := c.GetInt("userID")
	fileID := c.Param("id")

	err := h.fileService.DeleteFile(userID, fileID)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "File deleted successfully",
	})
}

func (h *Handlers) DownloadFile(c *gin.Context) {
	userID := c.GetInt("userID")
	fileID := c.Param("id")

	file, err := h.fileService.GetFileByID(fileID)
	if err != nil || file.UserID != userID {
		c.JSON(http.StatusNotFound, Response{
			Success: false,
			Error:   "File not found",
		})
		return
	}

	filePath := h.fileService.GetFilePath(file.Filename)
	c.Header("Content-Disposition", "attachment; filename=\""+file.OriginalFilename+"\"")
	c.Header("Content-Type", file.MimeType)
	c.File(filePath)
}

func (h *Handlers) PublicDownload(c *gin.Context) {
	token := c.Param("token")

	file, err := h.fileService.GetFileByDownloadToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Success: false,
			Error:   "File not found or expired",
		})
		return
	}

	
	if err := h.fileService.IncrementDownloadCount(file.ID); err != nil {
		
		println("Failed to increment download count:", err.Error())
	}

	filePath := h.fileService.GetFilePath(file.Filename)
	c.Header("Content-Disposition", "attachment; filename=\""+file.OriginalFilename+"\"")
	c.Header("Content-Type", file.MimeType)
	c.File(filePath)
}

func (h *Handlers) GenerateNewShareLink(c *gin.Context) {
	userID := c.GetInt("userID")
	fileID := c.Param("id")

	file, err := h.fileService.GenerateNewDownloadToken(userID, fileID)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "New share link generated",
		Data:    file,
	})
}

func (h *Handlers) GetFileInfo(c *gin.Context) {
	token := c.Param("token")

	file, err := h.fileService.GetFileByDownloadToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Success: false,
			Error:   "File not found or expired",
		})
		return
	}

	
	fileInfo := gin.H{
		"original_filename": file.OriginalFilename,
		"file_size":        file.FileSize,
		"mime_type":        file.MimeType,
		"download_count":   file.DownloadCount,
		"expires_at":       file.ExpiresAt,
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    fileInfo,
	})
}
