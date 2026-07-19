# NagarSeva - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and navigate
git clone <repo-url>
cd nagarseva

# 2. Start all services
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**That's it!** The entire stack (frontend, backend, database) is now running.

### Option 2: Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📝 First Steps

### 1. Create an Account
- Go to http://localhost:3000
- Click "Sign Up"
- Enter email, password, and name
- You're registered! Token is saved automatically

### 2. Report an Issue
- Click "Report Issue" from navbar
- **Upload Image**: Drag-drop or click to select
  - AI will analyze (or use mock if API unavailable)
- **Select Issue Type**: Pothole, Street Light, Garbage, etc.
- **Enter Description**: What's the problem?
- **Get Location**: Click GPS button or enter manually
- **Submit**: Creates complaint in database

### 3. Track Complaint
- Go to "My Complaints"
- See all your submitted issues
- Each shows status, priority, timeline
- Filter by status or priority

### 4. View Safety Map
- Click "Safety Map" in navbar
- See heatmap of high-risk zones
- Red = high risk, Yellow = medium, Green = low
- Hover for zone details

### 5. Admin Dashboard
- Log in with admin account (if available)
- Click "Dashboard"
- See all complaints, statistics
- Filter and sort by status, priority, etc.

---

## 🧪 Test with Mock Data

### 1. Register Test Account
```
Email: test@example.com
Password: Test@123
Name: Test User
```

### 2. API Testing with cURL

**Create Complaint:**
```bash
curl -X POST http://localhost:8000/api/complaints/create \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "image=@/path/to/image.jpg" \
  -F "location_lat=19.0760" \
  -F "location_lon=72.8777" \
  -F "description=Large pothole on main street" \
  -F "issue_type=pothole"
```

**List Complaints:**
```bash
curl http://localhost:8000/api/complaints?limit=10 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Get Dashboard Stats:**
```bash
curl http://localhost:8000/api/complaints/dashboard/stats
```

**Get Heatmap Data:**
```bash
curl http://localhost:8000/api/complaints/heatmap/data
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Database (already configured in docker-compose)
DATABASE_URL=postgresql://nagarseva:nagarseva_pass@postgres:5432/nagarseva

# AI API (optional)
GEMINI_API_KEY=your_key_here

# Security
JWT_SECRET=your-secret-key-change-in-prod

# Frontend
VITE_API_URL=http://localhost:8000
```

### Database Reset

```bash
# Stop and remove all services + data
docker-compose down -v

# Start fresh
docker-compose up
```

---

## 📁 Project Structure

```
nagarseva/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py       # Entry point
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   └── services/     # Business logic
│   └── requirements.txt
│
├── frontend/             # React application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API client
│   │   └── store/        # Redux store
│   └── package.json
│
├── docker-compose.yml    # Multi-container setup
├── Dockerfile.backend    # Backend container
├── Dockerfile.frontend   # Frontend container
└── README.md            # Full documentation
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000        # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart services
docker-compose restart postgres
docker-compose restart backend
```

### Image Upload Not Working

1. Ensure `backend/uploads/` directory exists
2. Check file is actually an image
3. File size under 10MB
4. Verify backend is running

### Frontend Can't Connect to API

1. Check backend is running: `curl http://localhost:8000/health`
2. Check `VITE_API_URL` environment variable
3. Clear browser cache and retry
4. Check browser console for CORS errors

### Token Expired or Invalid

- Log out and log back in
- Token is valid for 24 hours (configurable)
- Clear localStorage: `localStorage.clear()`

---

## 🚢 Deployment

### Build Docker Images

```bash
# Build backend
docker build -f Dockerfile.backend -t nagarseva-backend .

# Build frontend
docker build -f Dockerfile.frontend -t nagarseva-frontend .

# Push to registry
docker tag nagarseva-backend your-registry/nagarseva-backend:latest
docker push your-registry/nagarseva-backend:latest
```

### Deploy to Cloud

See main [README.md](README.md) for cloud deployment guides (AWS, Google Cloud, Azure, etc.)

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints/create` - Report issue
- `GET /api/complaints` - List complaints
- `GET /api/complaints/{id}` - Get details
- `PATCH /api/complaints/{id}/status` - Update status
- `GET /api/complaints/dashboard/stats` - Get statistics
- `GET /api/complaints/heatmap/data` - Get heatmap data

### Health
- `GET /health` - Health check
- `GET /` - Root endpoint (shows API info)

Full Swagger docs at: `http://localhost:8000/docs`

---

## 💡 Tips

1. **Use Mock Location**: If GPS doesn't work, manually enter Mumbai (19.0760, 72.8777)
2. **Test Images**: Use any image file to test upload and AI analysis
3. **Filters**: Try different filters on My Complaints and Dashboard
4. **Status Updates**: Admin can update complaint status (simulated)
5. **Dark Mode**: Add dark mode support in future versions

---

## 🤝 Contributing

See [README.md](README.md#contributing) for contribution guidelines.

---

## ❓ FAQ

**Q: Do I need a Google Gemini API key?**
A: No, the system uses mock AI analysis by default. Without the key, it randomly selects from realistic issue types.

**Q: Can I use this with my existing database?**
A: Yes, set `DATABASE_URL` in `.env` to your database. Tables are auto-created.

**Q: How do I reset the database?**
A: Run `docker-compose down -v` then `docker-compose up`.

**Q: Can I deploy this to production?**
A: Yes! See README.md for production deployment guides. Remember to:
- Change `JWT_SECRET`
- Set proper `CORS_ORIGINS`
- Use strong database password
- Configure Gemini API key

**Q: How do I customize the issue types?**
A: Edit `app/models/issue_type.py` and re-run migrations.

---

## 📞 Support

- 📧 Email: info@nagarseva.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/yourusername/nagarseva/issues)
- 💬 Discuss: [GitHub Discussions](https://github.com/yourusername/nagarseva/discussions)

---

**Happy reporting! 🎉**
