# NagarSeva - Civic Grievance Reporting & Community Safety Platform

![NagarSeva](https://img.shields.io/badge/Status-MVP-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## Overview

**NagarSeva** (meaning "city service" in Sanskrit/Hindi) is an AI-powered platform that empowers citizens to report civic infrastructure issues in their neighborhoods. From potholes and broken street lights to garbage dumping and blocked drains, NagarSeva provides a transparent, traceable way to lodge complaints and monitor their resolution.

### Key Features

✅ **Image-Based Reporting** - Upload photos of civic issues; AI automatically detects and categorizes the problem  
✅ **Smart Location Detection** - Auto-detect GPS location or manually pin on map  
✅ **AI-Powered Classification** - Google Gemini Vision API analyzes images to identify issue types  
✅ **Automatic Routing** - Complaints automatically routed to correct department based on issue type  
✅ **Real-Time Tracking** - Citizens can monitor their complaints from submission to resolution  
✅ **Community Safety Map** - Heatmap visualization showing high-risk zones and complaint density  
✅ **Admin Dashboard** - Officials can view, filter, and manage complaints across departments  
✅ **Responsive Design** - Mobile-first UI works seamlessly on all devices

---

## Tech Stack

### Backend
- **FastAPI** 0.104.1 - Modern Python web framework
- **SQLAlchemy** 2.0.23 - ORM for database operations
- **PostgreSQL** 15 - Relational database
- **Python-Jose** 3.3.0 - JWT token handling
- **Google Generative AI** 0.3.0 - Vision API for image analysis
- **Uvicorn** 0.24.0 - ASGI server

### Frontend
- **React** 18.2.0 - UI library
- **TypeScript** 5.2.2 - Type-safe JavaScript
- **Redux Toolkit** 1.9.7 - State management
- **React Router** 6.18.0 - Routing
- **Tailwind CSS** 3.3.6 - Utility-first CSS
- **Leaflet** 1.9.4 - Interactive maps
- **Axios** 1.6.0 - HTTP client

### DevOps
- **Docker** 24+ - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Persistent database

---

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 15+ (for local development)
- Google Generative AI API key (optional, for AI features)

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nagarseva.git
   cd nagarseva
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY if available
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

5. **Stop services**
   ```bash
   docker-compose down
   ```

### Local Development Setup

#### Backend Setup

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run migrations** (if needed)
   ```bash
   # Tables are auto-created by SQLAlchemy on first run
   ```

5. **Start backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register
  - Register new user
  - Body: { email, password, name }
  - Response: { access_token, user }

POST /api/auth/login
  - Login user
  - Body: { email, password }
  - Response: { access_token, user }

GET /api/auth/me
  - Get current user profile
  - Headers: Authorization: Bearer <token>
  - Response: { id, email, name, role }
```

### Complaint Endpoints

```
POST /api/complaints/create
  - Create new complaint with image
  - Headers: Authorization: Bearer <token>
  - Body: FormData(image, location_lat, location_lon, description, issue_type)
  - Response: { id, status, priority, created_at, ... }

GET /api/complaints
  - List complaints with filters
  - Query: status, priority, user_id, limit, offset
  - Response: { total, complaints: [...] }

GET /api/complaints/{id}
  - Get complaint details
  - Response: { id, description, status, images, history, ... }

PATCH /api/complaints/{id}/status
  - Update complaint status
  - Body: { status, reason }
  - Response: { id, status, ... }

GET /api/complaints/dashboard/stats
  - Get dashboard statistics
  - Response: { total_complaints, resolved_count, pending_count, ... }

GET /api/complaints/heatmap/data
  - Get heatmap data
  - Response: { heatmap_data: [{ lat, lon, complaint_count, severity }] }
```

### Health Check

```
GET /health
  - Health check endpoint
  - Response: { status: "ok" }
```

Full API documentation available at: `http://localhost:8000/docs` (Swagger UI)

---

## Project Structure

```
nagarseva/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration management
│   │   ├── database.py          # Database setup
│   │   ├── auth.py              # JWT & password utilities
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── complaint.py
│   │   │   ├── department.py
│   │   │   └── issue_type.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── user.py
│   │   │   └── complaint.py
│   │   ├── routes/              # API routes
│   │   │   ├── auth.py
│   │   │   └── complaints.py
│   │   └── services/            # Business logic
│   │       ├── user_service.py
│   │       ├── complaint_service.py
│   │       └── ai_service.py
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # User-uploaded images
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Main component
│   │   ├── index.css            # Global styles
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── ReportIssue.tsx
│   │   │   ├── MyComplaints.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── SafetyMap.tsx
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── ComplaintCard.tsx
│   │   │   ├── StatusTimeline.tsx
│   │   │   └── SafetyHeatmap.tsx
│   │   ├── services/            # API & utility services
│   │   │   ├── api.ts
│   │   │   ├── geolocation.ts
│   │   │   └── storage.ts
│   │   ├── store/               # Redux store
│   │   │   ├── index.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── complaintSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── styles/              # CSS modules
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── Dockerfile.backend           # Backend container image
├── Dockerfile.frontend          # Frontend container image
├── docker-compose.yml           # Multi-container orchestration
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

---

## Database Schema

### Users Table
```sql
- id (PK)
- email (UNIQUE)
- password_hash
- name
- role (citizen / staff / admin)
- created_at
```

### Complaints Table
```sql
- id (PK)
- user_id (FK)
- issue_type_id (FK)
- assigned_dept_id (FK)
- location_lat, location_lon
- location_address
- description
- status (submitted, assigned, in_progress, resolved, rejected)
- priority (low, medium, high, critical)
- created_at, assigned_at, resolved_at
```

### ComplaintImages Table
```sql
- id (PK)
- complaint_id (FK)
- image_path
- detected_issues
- confidence_score
- risk_level
- created_at
```

### ComplaintHistory Table
```sql
- id (PK)
- complaint_id (FK)
- old_status
- new_status
- change_reason
- timestamp
```

---

## Key Features Explained

### 1. Image Upload & AI Analysis
- Users upload an image of the civic issue
- Google Gemini Vision API analyzes the image
- AI detects issue type, risk level, and confidence score
- Falls back to mock analysis if API unavailable

### 2. Location Services
- Browser geolocation API for automatic location detection
- Manual latitude/longitude input as fallback
- Validation of coordinates (±90°, ±180°)

### 3. Complaint Routing
- AI-detected issue types automatically mapped to departments
- Examples:
  - Potholes → Public Works
  - Street lights → Electrical Department
  - Garbage → Sanitation Department
  - Drains → Drainage Department
  - Encroachment → Municipal Enforcement

### 4. Status Tracking
- Complaints progress through workflow: submitted → assigned → in_progress → resolved
- History tracked with timestamps and change reasons
- Visual timeline in UI

### 5. Safety Heatmap
- Grid-based complaint density visualization
- Color coding: Red (high risk) → Yellow (medium) → Green (low)
- Interactive zone details table

### 6. Admin Dashboard
- Global view of all complaints
- Filtering by status, priority, date range
- Statistics: total, resolved %, avg response time
- Sortable complaint table

---

## Environment Variables

Create a `.env` file from `.env.example` and configure:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nagarseva

# AI
GEMINI_API_KEY=your_key_here

# Security
JWT_SECRET=your-secure-random-string-min-32-chars
JWT_ALGORITHM=HS256

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:8000

# Files
UPLOAD_DIRECTORY=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

---

## Testing

### Backend Tests
```bash
cd backend
pytest -v
```

### Frontend Linting
```bash
cd frontend
npm run lint
```

---

## Deployment

### Docker Hub
```bash
docker build -t yourusername/nagarseva-backend -f Dockerfile.backend .
docker build -t yourusername/nagarseva-frontend -f Dockerfile.frontend .
docker push yourusername/nagarseva-backend
docker push yourusername/nagarseva-frontend
```

### Kubernetes
See `k8s/` directory for Kubernetes manifests (if available)

### Cloud Platforms
- **AWS**: Use ECS + RDS + CloudFront
- **Google Cloud**: Use Cloud Run + Cloud SQL + Cloud CDN
- **Azure**: Use Container Instances + Azure Database for PostgreSQL
- **Heroku**: Deploy using `heroku.yml` and `Procfile`

---

## API Response Examples

### Create Complaint
```json
{
  "id": 1,
  "user_id": 5,
  "description": "Large pothole on main street",
  "status": "submitted",
  "priority": "high",
  "location_lat": 19.0760,
  "location_lon": 72.8777,
  "location_address": "Main St, Mumbai",
  "created_at": "2024-01-15T10:30:00",
  "images": [
    {
      "image_path": "/uploads/5_pothole.jpg",
      "detected_issues": "Pothole detected on road surface",
      "risk_level": "high",
      "confidence_score": 89
    }
  ]
}
```

### Dashboard Stats
```json
{
  "total_complaints": 156,
  "resolved_count": 98,
  "pending_count": 34,
  "in_progress_count": 24,
  "avg_resolution_time_hours": 48.5,
  "by_status": {
    "submitted": 34,
    "assigned": 12,
    "in_progress": 12,
    "resolved": 98
  },
  "by_priority": {
    "low": 45,
    "medium": 67,
    "high": 34,
    "critical": 10
  }
}
```

---

## Troubleshooting

### Port Already in Use
```bash
# Linux/Mac
lsof -i :8000
kill -9 <PID>

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Reset database
docker-compose down -v
docker-compose up
```

### Image Upload Failing
- Ensure `backend/uploads/` directory exists and is writable
- Check file size limits in `config.py`
- Verify Content-Type is `multipart/form-data`

### Frontend API Calls Failing
- Check `VITE_API_URL` environment variable
- Verify backend is running on correct port
- Check browser console for CORS errors
- Ensure Authorization header has correct JWT format

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Python: Follow PEP 8 (use `black`, `flake8`)
- JavaScript: ESLint + Prettier
- Commit messages: Conventional Commits

---

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## Support & Contact

- 📧 Email: info@nagarseva.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nagarseva/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/nagarseva/discussions)
- 📱 Phone: 1800-NAGARSEVA

---

## Acknowledgments

- Inspiration: Citizen grievance systems worldwide
- Tech: FastAPI, React, PostgreSQL open-source communities
- Design: Modern, mobile-first UI/UX principles
- AI: Google Generative AI for vision-based issue detection

---

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] SMS notification system
- [ ] WhatsApp integration
- [ ] Multi-language support
- [ ] Real-time updates with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Machine learning for predictive maintenance
- [ ] Integration with municipal systems

---

**Made with ❤️ for sustainable cities**
