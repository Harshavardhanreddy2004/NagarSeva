# NagarSeva Deployment Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start-5-minutes)
2. [Detailed Setup](#detailed-setup)
3. [Docker Deployment](#docker-deployment)
4. [Local Development](#local-development)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- 4GB RAM available
- Port 80, 5173, 8000, 5432 available

### Steps

```bash
# 1. Navigate to project
cd nagarseva

# 2. Create environment file
cp .env.example .env

# 3. (Optional) Set GEMINI_API_KEY in .env
# If not set, AI will use mock responses

# 4. Start all services
docker-compose up -d

# 5. Wait for startup
sleep 10

# 6. Verify services
curl http://localhost:8000/health        # Should return: {"status": "ok"}
curl http://localhost                   # Should return HTML (frontend)

# 7. Open in browser
# Frontend:    http://localhost (or http://localhost:80)
# API Docs:    http://localhost:8000/docs
# Swagger UI:  http://localhost:8000/swagger
```

**Expected Output:**
```
Creating nagarseva-db ... done
Creating nagarseva-backend ... done
Creating nagarseva-frontend ... done

Backend status: healthy
Frontend status: healthy
```

---

## Detailed Setup

### Step 1: Clone & Configure

```bash
# Clone repository
git clone <your-repo-url> nagarseva
cd nagarseva

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required .env Variables:**
```env
# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=nagarseva_db
DB_USER=nagarseva_user
DB_PASSWORD=your_secure_password_here

# JWT
SECRET_KEY=your_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here  # Optional, uses mock if not set
MOCK_AI=false  # Set to true to use mock AI responses

# API
API_TITLE=NagarSeva API
API_DESCRIPTION=Civic Grievance Reporting Platform
API_VERSION=1.0.0
CORS_ORIGINS=["http://localhost", "http://localhost:5173", "http://localhost:8000"]

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Email (optional, for future notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

### Step 2: Build Docker Images

```bash
# Build all images
docker-compose build

# Check images created
docker images | grep nagarseva
```

### Step 3: Start Services

```bash
# Start in detached mode
docker-compose up -d

# Check status
docker-compose ps

# Expected output:
# NAME                  COMMAND                  SERVICE             STATUS
# nagarseva-backend     "uvicorn app.main:..."   backend             Up
# nagarseva-frontend    "nginx -g daemon ..."    frontend            Up
# nagarseva-db          "postgres -c shared..."  db                  Up
```

### Step 4: Initialize Database

```bash
# Database initializes automatically on first backend start
# Tables are created, departments and issue types are seeded

# Verify database
docker-compose logs backend | grep "✓"

# Expected logs:
# ✓ Database tables created
# ✓ Departments seeded: Road, Electricity, Sanitation, Drainage, Police
# ✓ Issue types seeded (11 total)
```

---

## Docker Deployment

### Docker Compose File Structure

```yaml
services:
  backend:      # FastAPI + Uvicorn (port 8000)
    - Python 3.11
    - FastAPI 0.104
    - SQLAlchemy
    - JWT authentication
    - Google Gemini integration

  frontend:     # React + Nginx (port 80)
    - Node 18 build stage
    - React 18 + TypeScript
    - Tailwind CSS
    - Nginx reverse proxy

  db:           # PostgreSQL (port 5432)
    - PostgreSQL 13
    - Automatic initialization
    - Persistent volume

volumes:
  postgres_data:   # Database persistence
  uploads:         # Image uploads storage
```

### Managing Services

**Start Services:**
```bash
docker-compose up -d
```

**Stop Services:**
```bash
docker-compose down
```

**Stop & Remove Data:**
```bash
docker-compose down -v
```

**View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 50 lines
docker-compose logs --tail 50 backend
```

**Execute Commands in Container:**
```bash
# Backend shell
docker-compose exec backend bash

# Database shell
docker-compose exec db psql -U nagarseva_user -d nagarseva_db

# Frontend shell
docker-compose exec frontend bash
```

**Rebuild Services:**
```bash
# Rebuild all
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## Local Development

### Backend Setup

```bash
# Navigate to backend
cd nagarseva/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate          # macOS/Linux
# or
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example ../.env
nano ../.env

# Run migrations (if needed)
# python -m alembic upgrade head

# Start development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server runs at: http://localhost:8000
# API Docs at: http://localhost:8000/docs
```

**Backend Requirements:**
- Python 3.9+
- PostgreSQL 13+ running on localhost:5432
- All dependencies in requirements.txt

### Frontend Setup

```bash
# Navigate to frontend
cd nagarseva/frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev

# Dev server runs at: http://localhost:5173
```

**Frontend Requirements:**
- Node.js 18+
- npm or yarn
- Backend API running on localhost:8000

### Database Setup (Local)

**Install PostgreSQL:**
```bash
# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Create Database:**
```bash
# Start PostgreSQL service
sudo service postgresql start              # Linux
brew services start postgresql             # macOS

# Create database
createdb nagarseva_db

# Create user
createuser -P nagarseva_user  # Enter password when prompted

# Grant privileges
psql -d nagarseva_db -c "GRANT ALL PRIVILEGES ON DATABASE nagarseva_db TO nagarseva_user;"

# Test connection
psql -U nagarseva_user -d nagarseva_db -c "SELECT 1;"
```

---

## Verification & Testing

### Quick Health Check

```bash
# Backend health
curl http://localhost:8000/health
# Expected: {"status": "ok"}

# Frontend health
curl -I http://localhost:5173
# Expected: HTTP 200

# API documentation
curl -I http://localhost:8000/docs
# Expected: HTTP 200
```

### Run Full Test Suite

```bash
# From nagarseva directory
chmod +x RUN_TESTS.sh
./RUN_TESTS.sh

# Or use the verification checklist
# See FINAL_VERIFICATION.md for manual testing
```

### Test Registration & Login

```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Expected response:
# {"access_token": "...", "user": {...}}

# Save token and test login
TOKEN="<access_token_from_above>"

curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {"id": 1, "email": "test@example.com", "name": "Test User", "role": "citizen"}
```

### Test Complaint Submission

```bash
# Create test image
convert -size 100x100 xc:blue /tmp/test.jpg

# Or use Python
python3 -c "from PIL import Image; Image.new('RGB', (100, 100), color='blue').save('/tmp/test.jpg')"

# Submit complaint
curl -X POST http://localhost:8000/api/complaints/create \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Issue" \
  -F "description=Test description" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "issue_type_id=1" \
  -F "image=@/tmp/test.jpg"

# Expected response:
# {"id": 1, "status": "submitted", ...}
```

---

## Troubleshooting

### Common Issues & Solutions

#### Services won't start
```bash
# Check port availability
lsof -i :8000              # Backend
lsof -i :5173              # Frontend
lsof -i :5432              # Database

# Kill process on port
kill -9 <PID>

# Or change port in docker-compose.yml
```

#### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps db

# Check logs
docker-compose logs db

# Verify credentials in .env
grep DB_ .env

# Reset database
docker-compose down -v
docker-compose up -d db
sleep 5
docker-compose up -d backend
```

#### Frontend can't reach backend
```bash
# Check VITE_API_URL
echo $VITE_API_URL
# or in .env.local
cat frontend/.env.local

# Should be: http://localhost:8000 (for local)
# or: http://api.yourdomain.com (for production)

# Verify backend is running
curl http://localhost:8000/health
```

#### Image upload fails
```bash
# Check uploads directory exists
mkdir -p backend/uploads
chmod 755 backend/uploads

# Check disk space
df -h

# Check file size limit in .env
grep MAX_FILE_SIZE .env
# Should be: MAX_FILE_SIZE=5242880 (5MB)
```

#### JWT token invalid
```bash
# Token might be expired (default: 30 minutes)
# Login again to get new token

# Verify SECRET_KEY in .env
grep SECRET_KEY .env

# If changed, all old tokens become invalid
```

#### Gemini API errors
```bash
# If GEMINI_API_KEY not set or invalid
# Set in .env or use mock:

export MOCK_AI=true  # Use mock AI responses

# Or provide valid API key:
export GEMINI_API_KEY="your-valid-key-here"

# Restart backend
docker-compose restart backend
```

### Debug Mode

```bash
# Enable verbose logging
export LOG_LEVEL=DEBUG

# Backend with debug logs
python -m uvicorn app.main:app --reload --log-level debug

# Frontend with debug logs
npm run dev -- --debug

# Docker compose with verbose output
docker-compose --verbose up
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] GEMINI_API_KEY configured or MOCK_AI enabled
- [ ] Database backups configured
- [ ] SSL/HTTPS certificate obtained
- [ ] Domain name configured
- [ ] CORS_ORIGINS updated for production domain
- [ ] Rate limiting enabled
- [ ] Monitoring/logging configured
- [ ] Secrets management in place

### AWS EC2 Deployment

```bash
# 1. Launch EC2 instance
# - Ubuntu 22.04 LTS
# - t3.medium or larger
# - Security group: allow 80, 443, 8000, 5432

# 2. Connect to instance
ssh -i key.pem ubuntu@your-instance-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Add user to docker group
sudo usermod -aG docker $USER

# 5. Clone repository
git clone <your-repo-url>
cd nagarseva

# 6. Create production .env
nano .env
# Set all production values

# 7. Configure SSL (Let's Encrypt)
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --standalone -d yourdomain.com

# 8. Update docker-compose.yml for SSL
# Add nginx configuration with SSL certificates

# 9. Start services
docker-compose up -d

# 10. Verify
curl https://yourdomain.com/health
```

### Heroku Deployment

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Add buildpacks
heroku buildpacks:add heroku/python -a your-app-name
heroku buildpacks:add heroku/nodejs -a your-app-name

# 3. Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0 -a your-app-name

# 4. Set environment variables
heroku config:set GEMINI_API_KEY=your-key -a your-app-name

# 5. Deploy
git push heroku main

# 6. Check logs
heroku logs -f -a your-app-name
```

### Docker Swarm / Kubernetes

For production-scale deployments, consider:

**Docker Swarm:**
```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml nagarseva
```

**Kubernetes:**
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/database-statefulset.yaml
```

### Monitoring & Maintenance

**Health Checks:**
```bash
# Setup periodic health checks
curl -f http://localhost:8000/health || echo "Backend down!"
```

**Log Rotation:**
```bash
# Configure logrotate for Docker logs
docker-compose logs --tail 100 > backup-logs-$(date +%Y%m%d).txt
```

**Database Backups:**
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR=/backups
docker-compose exec db pg_dump -U nagarseva_user nagarseva_db > \
  $BACKUP_DIR/nagarseva_db_$(date +%Y%m%d_%H%M%S).sql
```

**Performance Monitoring:**
```bash
# Check resource usage
docker stats

# Expected (normal):
# CONTAINER     CPU %    MEM USAGE
# backend       1-5%     150-250M
# frontend      0-1%     50-100M
# db            2-5%     200-300M
```

---

## Useful Commands Reference

| Task | Command |
|------|---------|
| Start services | `docker-compose up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Rebuild images | `docker-compose build --no-cache` |
| Reset database | `docker-compose down -v && docker-compose up -d` |
| Access PostgreSQL | `docker-compose exec db psql -U nagarseva_user -d nagarseva_db` |
| Backend shell | `docker-compose exec backend bash` |
| Frontend shell | `docker-compose exec frontend bash` |
| Run tests | `./RUN_TESTS.sh` |
| Check health | `curl http://localhost:8000/health` |
| View API docs | Browser: `http://localhost:8000/docs` |

---

## Support & Next Steps

### Documentation
- **README.md:** Project overview
- **QUICK_START.md:** 5-minute setup
- **IMPLEMENTATION_SUMMARY.md:** File listing
- **FINAL_VERIFICATION.md:** Complete test checklist
- **FINAL_DELIVERABLES.md:** Technical summary

### Getting Help
1. Check **Troubleshooting** section above
2. Check service logs: `docker-compose logs <service>`
3. Review FINAL_VERIFICATION.md for detailed steps
4. Check GitHub issues if using version control

### Production Readiness
Once deployed, ensure:
- [x] SSL/HTTPS working
- [x] Database backups scheduled
- [x] Monitoring alerts configured
- [x] Error logging set up
- [x] Rate limiting enabled
- [x] CORS properly configured

---

**Status:** ✅ Ready for Production Deployment

**Last Updated:** 2024
