package config

import (
	"os"
)

type Config struct {
	Port         string
	DatabasePath string
	UploadsPath  string
	JWTSecret    string
}

func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		DatabasePath: getEnv("DATABASE_PATH", "./anonlink.db"),
		UploadsPath:  getEnv("UPLOADS_PATH", "./uploads"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-here-change-this"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
