package files

import (
	"database/sql"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	db          *sql.DB
	uploadsPath string
}

type File struct {
	ID               string    `json:"id"`
	UserID           int       `json:"user_id"`
	Filename         string    `json:"filename"`
	OriginalFilename string    `json:"original_filename"`
	FileSize         int64     `json:"file_size"`
	MimeType         string    `json:"mime_type"`
	DownloadToken    string    `json:"download_token"`
	DownloadCount    int       `json:"download_count"`
	MaxDownloads     int       `json:"max_downloads"`
	ExpiresAt        *string   `json:"expires_at,omitempty"`
	CreatedAt        string    `json:"created_at"`
}

func NewService(db *sql.DB, uploadsPath string) *Service {
	return &Service{
		db:          db,
		uploadsPath: uploadsPath,
	}
}

func (s *Service) UploadFile(userID int, fileHeader *multipart.FileHeader) (*File, error) {
	
	fileID := uuid.New().String()
	downloadToken := uuid.New().String()

	
	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%s%s", fileID, ext)
	filePath := filepath.Join(s.uploadsPath, filename)

	
	src, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	
	expiresAt := time.Now().Add(24 * time.Hour).Format("2006-01-02 15:04:05")

	
	file := &File{
		ID:               fileID,
		UserID:           userID,
		Filename:         filename,
		OriginalFilename: fileHeader.Filename,
		FileSize:         fileHeader.Size,
		MimeType:         fileHeader.Header.Get("Content-Type"),
		DownloadToken:    downloadToken,
		MaxDownloads:     -1, 
		ExpiresAt:        &expiresAt,
	}

	query := `INSERT INTO files (id, user_id, filename, original_filename, file_size, mime_type, download_token, max_downloads, expires_at) 
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	
	_, err = s.db.Exec(query, file.ID, file.UserID, file.Filename, file.OriginalFilename, 
		file.FileSize, file.MimeType, file.DownloadToken, file.MaxDownloads, file.ExpiresAt)
	if err != nil {
		
		os.Remove(filePath)
		return nil, fmt.Errorf("failed to save file metadata: %w", err)
	}

	return s.GetFileByID(fileID)
}

func (s *Service) GetUserFiles(userID int) ([]*File, error) {
	query := `SELECT id, user_id, filename, original_filename, file_size, mime_type, 
	          download_token, download_count, max_downloads, expires_at, created_at 
	          FROM files WHERE user_id = ? ORDER BY created_at DESC`
	
	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user files: %w", err)
	}
	defer rows.Close()

	var files []*File
	for rows.Next() {
		file := &File{}
		err := rows.Scan(&file.ID, &file.UserID, &file.Filename, &file.OriginalFilename,
			&file.FileSize, &file.MimeType, &file.DownloadToken, &file.DownloadCount,
			&file.MaxDownloads, &file.ExpiresAt, &file.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan file: %w", err)
		}
		files = append(files, file)
	}

	return files, nil
}

func (s *Service) GetFileByID(fileID string) (*File, error) {
	file := &File{}
	query := `SELECT id, user_id, filename, original_filename, file_size, mime_type, 
	          download_token, download_count, max_downloads, expires_at, created_at 
	          FROM files WHERE id = ?`
	
	err := s.db.QueryRow(query, fileID).Scan(&file.ID, &file.UserID, &file.Filename,
		&file.OriginalFilename, &file.FileSize, &file.MimeType, &file.DownloadToken,
		&file.DownloadCount, &file.MaxDownloads, &file.ExpiresAt, &file.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	return file, nil
}

func (s *Service) GetFileByDownloadToken(token string) (*File, error) {
	file := &File{}
	query := `SELECT id, user_id, filename, original_filename, file_size, mime_type, 
	          download_token, download_count, max_downloads, expires_at, created_at 
	          FROM files WHERE download_token = ?`
	
	err := s.db.QueryRow(query, token).Scan(&file.ID, &file.UserID, &file.Filename,
		&file.OriginalFilename, &file.FileSize, &file.MimeType, &file.DownloadToken,
		&file.DownloadCount, &file.MaxDownloads, &file.ExpiresAt, &file.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	
	if file.ExpiresAt != nil {
		expiresAt, err := time.Parse("2006-01-02 15:04:05", *file.ExpiresAt)
		if err == nil && time.Now().After(expiresAt) {
			return nil, fmt.Errorf("file has expired")
		}
	}

	
	if file.MaxDownloads != -1 && file.DownloadCount >= file.MaxDownloads {
		return nil, fmt.Errorf("download limit exceeded")
	}

	return file, nil
}

func (s *Service) IncrementDownloadCount(fileID string) error {
	query := `UPDATE files SET download_count = download_count + 1 WHERE id = ?`
	_, err := s.db.Exec(query, fileID)
	return err
}

func (s *Service) DeleteFile(userID int, fileID string) error {
	
	file := &File{}
	query := `SELECT filename FROM files WHERE id = ? AND user_id = ?`
	err := s.db.QueryRow(query, fileID, userID).Scan(&file.Filename)
	if err != nil {
		return fmt.Errorf("file not found or access denied: %w", err)
	}

	
	deleteQuery := `DELETE FROM files WHERE id = ? AND user_id = ?`
	result, err := s.db.Exec(deleteQuery, fileID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete file from database: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("file not found or access denied")
	}

	
	filePath := filepath.Join(s.uploadsPath, file.Filename)
	if err := os.Remove(filePath); err != nil {
		
		fmt.Printf("Warning: failed to delete file from disk: %s\n", err)
	}

	return nil
}

func (s *Service) GetFilePath(filename string) string {
	return filepath.Join(s.uploadsPath, filename)
}


func (s *Service) CleanupExpiredFiles() error {
	
	query := `SELECT id, filename FROM files WHERE expires_at IS NOT NULL AND expires_at < datetime('now')`
	
	rows, err := s.db.Query(query)
	if err != nil {
		return fmt.Errorf("failed to query expired files: %w", err)
	}
	defer rows.Close()

	var expiredFiles []struct {
		ID       string
		Filename string
	}

	for rows.Next() {
		var file struct {
			ID       string
			Filename string
		}
		if err := rows.Scan(&file.ID, &file.Filename); err != nil {
			fmt.Printf("Warning: failed to scan expired file: %s\n", err)
			continue
		}
		expiredFiles = append(expiredFiles, file)
	}

	
	for _, file := range expiredFiles {
		
		deleteQuery := `DELETE FROM files WHERE id = ?`
		if _, err := s.db.Exec(deleteQuery, file.ID); err != nil {
			fmt.Printf("Warning: failed to delete expired file from database: %s\n", err)
			continue
		}

		
		filePath := filepath.Join(s.uploadsPath, file.Filename)
		if err := os.Remove(filePath); err != nil {
			fmt.Printf("Warning: failed to delete expired file from disk: %s\n", err)
		}
	}

	if len(expiredFiles) > 0 {
		fmt.Printf("Cleaned up %d expired files\n", len(expiredFiles))
	}

	return nil
}


func (s *Service) GenerateNewDownloadToken(userID int, fileID string) (*File, error) {
	
	file, err := s.GetFileByID(fileID)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}
	
	if file.UserID != userID {
		return nil, fmt.Errorf("access denied")
	}

	
	newToken := uuid.New().String()
	
	
	query := `UPDATE files SET download_token = ? WHERE id = ?`
	_, err = s.db.Exec(query, newToken, fileID)
	if err != nil {
		return nil, fmt.Errorf("failed to update download token: %w", err)
	}

	return s.GetFileByID(fileID)
}
