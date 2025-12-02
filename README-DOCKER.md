# PP Cloud Media - Docker Deployment Guide

This guide explains how to deploy the PP Cloud Media website using Docker and nginx.

## 🐳 Docker Setup Overview

The PP Cloud Media website has been successfully dockerized for production deployment using nginx as the web server. The setup includes:

- **Dockerfile**: Multi-stage build configuration for nginx-based static website
- **docker-compose.yml**: Container orchestration with networking and health checks
- **nginx.conf**: Optimized nginx configuration with security headers and caching
- **.dockerignore**: Build optimization to exclude unnecessary files

## 📋 Prerequisites

Ensure you have the following installed:
- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## 🚀 Quick Start

### Method 1: Using Deployment Script (Recommended)

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Method 2: Manual Docker Commands

```bash
# Build and start the container
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🌐 Accessing the Website

Once deployed, the website will be available at:
- **Local**: http://localhost
- **Network**: http://YOUR_SERVER_IP

## 📁 Project Structure

```
PPCLOUD_V3/
├── Dockerfile              # Container build configuration
├── docker-compose.yml      # Container orchestration
├── nginx.conf            # Nginx server configuration
├── .dockerignore         # Build optimization
├── deploy.sh            # Deployment automation script
├── index.html           # Main website page
├── locations.html       # LED locations map page
├── style.css           # Stylesheets
├── script.js           # JavaScript functionality
├── locations-data.js    # Location data for maps
└── example.png         # Sample image
```

## ⚙️ Configuration Details

### Dockerfile Features
- **Base Image**: `nginx:alpine` (lightweight and secure)
- **Security**: Runs as non-root `nginx` user
- **Health Check**: Built-in health monitoring
- **Optimization**: Multi-layer caching for faster builds

### nginx.conf Optimizations
- **Performance**: Gzip compression enabled
- **Security**: Security headers (XSS protection, content type options)
- **Caching**: Static assets cached for 1 year
- **SPF**: Content Security Policy for XSS prevention
- **Error Handling**: Custom error pages

### docker-compose.yml Features
- **Networking**: Custom bridge network for isolation
- **Health Monitoring**: Automated health checks
- **Restart Policy**: `unless-stopped` for reliability
- **Port Mapping**: 80:80 for standard HTTP
- **Labels**: Traefik integration ready

## 🔧 Management Commands

### Container Operations
```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down

# Restart the service
docker-compose restart

# Rebuild with latest changes
docker-compose up -d --build

# View real-time logs
docker-compose logs -f

# Check container status
docker-compose ps

# Execute commands inside container
docker-compose exec ppcloud-website sh
```

### Debugging
```bash
# Check container logs for errors
docker logs ppcloud-media-website

# Test nginx configuration
docker exec ppcloud-website nginx -t

# Reload nginx without restart
docker exec ppcloud-website nginx -s reload

# Check network connectivity
docker exec ppcloud-website wget -q -O - http://localhost/
```

## 🔍 Health Checks

The container includes automated health monitoring:
- **Interval**: Every 30 seconds
- **Timeout**: 3 seconds per check
- **Retries**: 3 consecutive failures before unhealthy
- **Test**: HTTP GET request to localhost/

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' ppcloud-media-website
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 80 already in use**
   ```bash
   # Check what's using port 80
   sudo netstat -tlnp | grep :80
   
   # Stop conflicting service or change port in docker-compose.yml
   ```

2. **Container won't start**
   ```bash
   # Check logs for errors
   docker logs ppcloud-media-website
   
   # Verify nginx config
   docker exec ppcloud-website nginx -t
   ```

3. **Website not accessible**
   ```bash
   # Check if container is running
   docker ps | grep ppcloud
   
   # Check port mapping
   docker-compose ps
   
   # Test from inside container
   docker exec ppcloud-website wget -q -O - http://localhost/
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions if needed
   sudo chown -R 1001:1001 .
   
   # Rebuild container
   docker-compose up -d --build
   ```

## 🔄 Deployment Workflow

### For Production
1. **Prepare Environment**
   ```bash
   git pull origin main
   ```

2. **Deploy Updates**
   ```bash
   ./deploy.sh
   ```

3. **Verify Deployment**
   ```bash
   curl -I http://localhost
   docker-compose ps
   ```

### For Development
1. **Make Changes**
   ```bash
   # Edit files locally
   ```

2. **Test Changes**
   ```bash
   docker-compose up -d --build
   ```

3. **Debug if needed**
   ```bash
   docker-compose logs -f
   ```

## 📊 Monitoring

### Resource Usage
```bash
# Monitor container resource usage
docker stats ppcloud-media-website

# Check disk usage
docker system df

# Monitor health status
watch -n 5 'docker inspect --format="{{.State.Health.Status}}" ppcloud-media-website'
```

### Log Management
```bash
# View recent logs
docker logs --tail=100 ppcloud-media-website

# Export logs to file
docker logs ppcloud-media-website > nginx.log

# Follow logs with timestamps
docker logs -f --timestamps ppcloud-media-website
```

## 🔒 Security Considerations

- **Non-root User**: Container runs as nginx user (UID 1001)
- **Minimal Base**: Uses lightweight Alpine Linux
- **Security Headers**: XSS protection, content type options, CSP
- **File Access**: Sensitive files blocked (.conf, .log, .sql, etc.)
- **Network Isolation**: Custom bridge network

## 🚀 Performance Optimizations

- **Static Caching**: CSS/JS/images cached for 1 year
- **HTML Caching**: HTML files cached for 1 hour
- **Gzip Compression**: Text-based assets compressed
- **Keep-alive**: Persistent connections
- **Worker Processes**: Optimized for container resources

## 📈 Scaling Options

### Horizontal Scaling
```yaml
# In docker-compose.yml, add:
services:
  ppcloud-website:
    deploy:
      replicas: 3
```

### Load Balancing
For production, consider adding a load balancer:
```yaml
services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - ppcloud-website
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy PP Cloud Media
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Production
        run: |
          docker-compose up -d --build
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs -f`
3. Verify all prerequisites are installed
4. Check disk space and system resources

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Docker 20.10+, Docker Compose 2.0+
