FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o anonlink ./cmd/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite
WORKDIR /root/

# Copy the binary
COPY --from=builder /app/anonlink .

# Create directories
RUN mkdir -p uploads

# Expose port
EXPOSE 8080

# Set default environment variables
ENV PORT=8080
ENV DATABASE_PATH=/data/anonlink.db
ENV UPLOADS_PATH=/data/uploads
ENV JWT_SECRET=change-this-secret-key

# Create volume for persistent data
VOLUME ["/data"]

CMD ["./anonlink"]
