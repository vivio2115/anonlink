#!/bin/bash

echo "Starting anonlink development server..."

export PORT=8080
export JWT_SECRET="dev-secret-key-change-in-production"
export DATABASE_PATH="./anonlink.db"
export UPLOADS_PATH="./uploads"

if command -v air &> /dev/null; then
    echo "Using air for live reload..."
    air -c .air.toml
else
    echo "Running with go run..."
    go run ./cmd/main.go
fi
