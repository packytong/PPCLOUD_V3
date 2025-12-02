#!/bin/bash

# PP Cloud Media - Docker Deployment Script
# This script builds and deploys the PP Cloud Media website using Docker

set -e

echo "🚀 Starting PP Cloud Media Website Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if required files exist
print_header "Checking Prerequisites"
required_files=("Dockerfile" "docker-compose.yml" "nginx.conf" "index.html")

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file $file not found!"
        exit 1
    else
        print_status "✓ $file found"
    fi
done

# Stop and remove existing containers
print_header "Cleaning Up Existing Containers"
if [[ $(docker ps -q -f "name=ppcloud-media-website") ]]; then
    print_status "Stopping existing container..."
    docker-compose down
else
    print_status "No existing containers to stop"
fi

# Build and start the application
print_header "Building and Starting Application"
print_status "Building Docker image..."
docker-compose build --no-cache

print_status "Starting container..."
docker-compose up -d

# Wait for container to be healthy
print_header "Checking Application Health"
print_status "Waiting for container to be healthy..."

for i in {1..30}; do
    if [[ $(docker inspect -f '{{.State.Health.Status}}' ppcloud-media-website 2>/dev/null) == "healthy" ]]; then
        print_status "✓ Container is healthy!"
        break
    fi
    
    if [[ $i -eq 30 ]]; then
        print_warning "Container health check timed out, but container might still be starting..."
        break
    fi
    
    sleep 2
    echo -n "."
done

echo ""

# Show container status
print_header "Container Status"
docker ps -f "name=ppcloud-media-website"

# Show logs if there are any errors
if [[ $(docker logs ppcloud-media-website 2>&1 | grep -i error | wc -l) -gt 0 ]]; then
    print_warning "Found errors in container logs:"
    docker logs ppcloud-media-website | grep -i error
fi

print_header "Deployment Complete!"
echo -e "${GREEN}🎉 PP Cloud Media website is now running!${NC}"
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  • Local: ${GREEN}http://localhost${NC}"
echo -e "  • Network: ${GREEN}http://$(hostname -I | awk '{print $1}')${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  • Stop: ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart: ${YELLOW}docker-compose restart${NC}"
echo -e "  • Rebuild: ${YELLOW}docker-compose up -d --build${NC}"
echo ""
echo -e "${BLUE}Container Information:${NC}"
docker-compose ps
