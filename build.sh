#!/bin/bash

echo "Building anonlink server..."

# Build the application
go build -o bin/anonlink ./cmd/main.go

if [ $? -eq 0 ]; then
    echo "Build successful! Binary created at bin/anonlink"
    echo ""
    echo "To run the server:"
    echo "  ./bin/anonlink"
    echo ""
    echo "Environment variables you can set:"
    echo "  PORT=8080 (default)"
    echo "  DATABASE_PATH=./anonlink.db (default)"
    echo "  UPLOADS_PATH=./uploads (default)"
    echo "  JWT_SECRET=your-secret-key-here (CHANGE THIS!)"
else
    echo "Build failed!"
    exit 1
fi
