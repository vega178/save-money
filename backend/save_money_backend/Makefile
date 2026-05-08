# Makefile for Save Money Backend Application

# Variables
MYSQL_ROOT_PASSWORD ?= rootpassword
MYSQL_DATABASE = db_save_money
MYSQL_USER = root
MYSQL_PASSWORD ?= rootpassword
MYSQL_HOST = localhost
MYSQL_PORT = 3306
APP_NAME = save_money_backend
JAR_FILE = target/$(APP_NAME)-0.0.1-SNAPSHOT.jar

# Default target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  setup-db     - Install and configure MySQL database"
	@echo "  create-db    - Create the application database"
	@echo "  build        - Build the Spring Boot application"
	@echo "  run          - Start the backend application"
	@echo "  clean        - Clean build artifacts"
	@echo "  stop-db      - Stop MySQL service"
	@echo "  start-db     - Start MySQL service"
	@echo "  reset-db     - Reset database (drop and recreate)"
	@echo "  full-setup   - Complete setup (database + build + run)"
	@echo "  status       - Check application and database status"

# Install and setup MySQL database
.PHONY: setup-db
setup-db:
	@echo "Setting up MySQL database..."
	@if ! command -v mysql >/dev/null 2>&1; then \
		echo "Installing MySQL via Homebrew..."; \
		brew install mysql; \
	else \
		echo "MySQL already installed"; \
	fi
	@echo "Starting MySQL service..."
	brew services start mysql
	@sleep 3
	@echo "Creating database and user..."
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -e "CREATE DATABASE IF NOT EXISTS $(MYSQL_DATABASE);" || true
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -e "SHOW DATABASES;"
	@echo "Database setup completed!"

# Create database only
.PHONY: create-db
create-db:
	@echo "Creating database $(MYSQL_DATABASE)..."
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -e "CREATE DATABASE IF NOT EXISTS $(MYSQL_DATABASE);"
	@echo "Database $(MYSQL_DATABASE) created successfully!"

# Start MySQL service
.PHONY: start-db
start-db:
	@echo "Starting MySQL service..."
	@
	@sleep 2brew services start mysql
	@echo "MySQL service started!"

# Stop MySQL service
.PHONY: stop-db
stop-db:
	@echo "Stopping MySQL service..."
	@brew services stop mysql
	@echo "MySQL service stopped!"

# Reset database (drop and recreate)
.PHONY: reset-db
reset-db:
	@echo "Resetting database..."
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -e "DROP DATABASE IF EXISTS $(MYSQL_DATABASE);"
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -e "CREATE DATABASE $(MYSQL_DATABASE);"
	@echo "Database reset completed!"

# Build the application
.PHONY: build
build:
	@echo "Building Spring Boot application..."
	@./mvnw clean package -DskipTests
	@echo "Build completed!"

# Run the application in development mode
.PHONY: run
run:
	@echo "Starting Spring Boot application..."
	@./mvnw spring-boot:run

# Run the application from JAR
.PHONY: run-jar
run-jar: build
	@echo "Starting application from JAR file..."
	@java -jar $(JAR_FILE)

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	@./mvnw clean
	@echo "Clean completed!"

# Complete setup: database + build + run
.PHONY: full-setup
full-setup: setup-db build run

# Check status of services
.PHONY: status
status:
	@echo "=== MySQL Service Status ==="
	@brew services list | grep mysql || echo "MySQL service not found"
	@echo ""
	@echo "=== Database Status ==="
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -e "SHOW DATABASES;" 2>/dev/null | grep $(MYSQL_DATABASE) && echo "Database $(MYSQL_DATABASE) exists" || echo "Database $(MYSQL_DATABASE) not found"
	@echo ""
	@echo "=== Application Build Status ==="
	@if [ -f "$(JAR_FILE)" ]; then echo "JAR file exists: $(JAR_FILE)"; else echo "JAR file not found. Run 'make build' first."; fi

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	@./mvnw test

# Development mode (with hot reload)
.PHONY: dev
dev: start-db
	@echo "Starting in development mode with hot reload..."
	@./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"

# Production mode
.PHONY: prod
prod: build
	@echo "Starting in production mode..."
	@java -jar $(JAR_FILE) --spring.profiles.active=prod

# Database backup
.PHONY: backup-db
backup-db:
	@echo "Creating database backup..."
	@mysqldump -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) $(MYSQL_DATABASE) > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Database backup created!"

# Restore database from backup
.PHONY: restore-db
restore-db:
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Usage: make restore-db BACKUP_FILE=<backup_file>"; exit 1; fi
	@echo "Restoring database from $(BACKUP_FILE)..."
	@mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) $(MYSQL_DATABASE) < $(BACKUP_FILE)
	@echo "Database restored!"

# Install dependencies and setup development environment
.PHONY: install
install:
	@echo "Installing development dependencies..."
	@if ! command -v brew >/dev/null 2>&1; then \
		echo "Please install Homebrew first: https://brew.sh/"; \
		exit 1; \
	fi
	@if ! command -v java >/dev/null 2>&1; then \
		echo "Installing Java 17..."; \
		brew install openjdk@17; \
	fi
	@echo "Development environment ready!"

# Logs
.PHONY: logs
logs:
	@echo "Showing recent application logs..."
	@tail -f logs/application.log 2>/dev/null || echo "No log file found. Application might not be running."
