package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db        *sql.DB
	jwtSecret []byte
}

type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func NewService(db *sql.DB, jwtSecret string) *Service {
	return &Service{
		db:        db,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *Service) Register(username, email, password string) (*User, error) {
	
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	
	query := `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`
	result, err := s.db.Exec(query, username, email, hashedPassword)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	userID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	return s.GetUserByID(int(userID))
}

func (s *Service) Login(username, password string) (*User, string, error) {
	user, hashedPassword, err := s.getUserWithPassword(username)
	if err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	
	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

func (s *Service) GenerateToken(user *User) (string, error) {
	claims := Claims{
		UserID:   user.ID,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *Service) GetUserByID(id int) (*User, error) {
	user := &User{}
	query := `SELECT id, username, email, created_at FROM users WHERE id = ?`
	err := s.db.QueryRow(query, id).Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return user, nil
}

func (s *Service) getUserWithPassword(username string) (*User, string, error) {
	user := &User{}
	var hashedPassword string
	query := `SELECT id, username, email, created_at, password_hash FROM users WHERE username = ?`
	err := s.db.QueryRow(query, username).Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt, &hashedPassword)
	if err != nil {
		return nil, "", fmt.Errorf("user not found: %w", err)
	}
	return user, hashedPassword, nil
}
