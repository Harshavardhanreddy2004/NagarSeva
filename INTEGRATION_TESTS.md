# Integration Tests - NagarSeva MVP

## Pre-Test Checklist

- [ ] Docker Compose services are running: `docker-compose ps`
- [ ] Backend is healthy: `curl http://localhost:8000/health`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] Database is connected

## Test Suite

### 1. Backend API Tests

#### Health Check
```bash
curl -X GET http://localhost:8000/health
# Expected: { "status": "ok" }
```

#### Root Endpoint
```bash
curl -X GET http://localhost:8000/
# Expected: { "message": "NagarSeva API", "status": "healthy", "version": "0.1.0" }
```

#### User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }'
# Expected: { "access_token": "...", "user": { "id": 1, "email": "testuser@example.com", ... } }
```

#### User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
# Expected: { "access_token": "...", "user": { ... } }
# Save the access_token for next tests
```

#### Get Current User
```bash
TOKEN="<access_token_from_login>"
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
# Expected: { "id": 1, "email": "testuser@example.com", "name": "Test User", "role": "citizen" }
```

#### Get Dashboard Stats (Before any complaints)
```bash
curl -X GET http://localhost:8000/api/complaints/dashboard/stats
# Expected: { "total_complaints": 0, "resolved_count": 0, "pending_count": 0, ... }
```

#### List Complaints (Empty)
```bash
TOKEN="<access_token>"
curl -X GET http://localhost:8000/api/complaints \
  -H "Authorization: Bearer $TOKEN"
# Expected: { "total": 0, "complaints": [] }
```

#### Create Complaint (With Image)

First, create a test image or use an existing one:
```bash
# Download a test image
curl -o test-image.jpg https://via.placeholder.com/200

# Create complaint
TOKEN="<access_token>"
curl -X POST http://localhost:8000/api/complaints/create \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.jpg" \
  -F "location_lat=19.0760" \
  -F "location_lon=72.8777" \
  -F "description=Large pothole blocking traffic" \
  -F "issue_type=pothole"
# Expected: { "id": 1, "status": "submitted", "priority": "high/medium", "images": [...] }
# Save the complaint id from response
```

#### List Complaints (After creating one)
```bash
TOKEN="<access_token>"
curl -X GET http://localhost:8000/api/complaints \
  -H "Authorization: Bearer $TOKEN"
# Expected: { "total": 1, "complaints": [{ "id": 1, "description": "...", ... }] }
```

#### Get Single Complaint
```bash
COMPLAINT_ID="1"
curl -X GET http://localhost:8000/api/complaints/$COMPLAINT_ID
# Expected: { "id": 1, "description": "...", "images": [...], "history": [...] }
```

#### Update Complaint Status
```bash
COMPLAINT_ID="1"
curl -X PATCH http://localhost:8000/api/complaints/$COMPLAINT_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "assigned",
    "reason": "Routed to Public Works Department"
  }'
# Expected: { "id": 1, "status": "assigned", ... }
```

#### Get Heatmap Data
```bash
curl -X GET http://localhost:8000/api/complaints/heatmap/data
# Expected: { "heatmap_data": [{ "lat": 19.0760, "lon": 72.8777, "complaint_count": 1, "severity": "high/medium/low" }] }
```

#### Get Dashboard Stats (After complaint)
```bash
curl -X GET http://localhost:8000/api/complaints/dashboard/stats
# Expected: { "total_complaints": 1, "resolved_count": 0, "pending_count": 0, "in_progress_count": 0, ... }
```

---

### 2. Frontend UI Tests

#### Home Page
1. Navigate to `http://localhost:3000`
2. ✓ Page loads with hero banner
3. ✓ "Platform Impact" statistics visible (total complaints, resolved %, pending, in progress)
4. ✓ "How It Works" feature cards display
5. ✓ CTA buttons visible and functional

#### Sign Up Flow
1. Click "Sign Up" button
2. ✓ Navigate to `/register` page
3. Fill in:
   - Name: "Test User"
   - Email: "testuser2@example.com"
   - Password: "TestPass123"
   - Confirm: "TestPass123"
4. ✓ Click "Create Account"
5. ✓ Redirect to home page
6. ✓ User is logged in (name shows in navbar)

#### Login Flow
1. Log out (if logged in)
2. Click "Login"
3. ✓ Navigate to `/login` page
4. Fill in email and password
5. ✓ Click "Login"
6. ✓ Redirect to home
7. ✓ User logged in state reflected in navbar

#### Report Issue Flow
1. Log in first
2. Click "Report Issue"
3. ✓ Navigate to `/report` page
4. Test Image Upload:
   - Drag-drop an image
   - ✓ Image appears as preview
   - ✓ "✓ Image selected" indicator shows
5. Test Location Picker:
   - Click "📍 Get My Location"
   - ✓ GPS coordinates populate
   - Or manually enter: Lat=19.0760, Lon=72.8777
   - ✓ Green confirmation box shows
6. Fill in:
   - Issue Type: "🕳️ Pothole / Road Damage"
   - Description: "Large pothole on main street"
7. ✓ Click "✓ Submit Report"
8. ✓ Success message appears
9. ✓ Redirect to `/my-complaints`

#### My Complaints Page
1. Navigate to `/my-complaints`
2. ✓ Page loads with complaint list
3. ✓ Complaint card shows:
   - Issue type/description
   - Status badge
   - Priority level
   - Location
   - Date created
4. Test Filters:
   - Filter by Status: "submitted"
   - ✓ List updates
   - Filter by Priority: "high"
   - ✓ List updates
   - Click "Clear Filters"
   - ✓ All complaints shown
5. ✓ Summary statistics display at bottom

#### Safety Map Page
1. Click "Safety Map" in navbar
2. ✓ Navigate to `/safety-map`
3. ✓ Map loads (Leaflet with OpenStreetMap)
4. ✓ Heatmap grid points visible (if complaints exist)
5. ✓ Legend shows risk levels (Red, Yellow, Green)
6. ✓ Zone details table displays:
   - Zone ID
   - Location coordinates
   - Complaint count
   - Risk level badge
   - Top issues

#### Dashboard Page (Admin)
1. Navigate to `/dashboard`
2. ✓ Page loads with statistics cards:
   - Total Complaints
   - Resolved count & %
   - Pending count
   - In Progress count
   - Avg Response Time
3. Test Filters:
   - Filter by Status
   - Filter by Priority
   - Click "Clear Filters"
4. ✓ Complaints table displays with:
   - ID, Description, Status, Priority, Location, Date
   - Sortable columns
   - Color-coded badges

#### Logout
1. Click user menu in navbar
2. ✓ Click "Logout"
3. ✓ Redirect to home
4. ✓ Navbar shows login/signup options
5. ✓ Token removed from localStorage

---

### 3. State Management Tests

#### Redux State Tests
Open browser DevTools → Application → Local Storage

**After Login:**
- ✓ `token` should be saved

**After Creating Complaint:**
- ✓ Complaint appears in Redux complaints list
- ✓ Complaint visible in My Complaints page

**After Logout:**
- ✓ `token` is deleted from localStorage
- ✓ User state is null

---

### 4. Error Handling Tests

#### Invalid Login Credentials
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "password": "wrong"}'
# Expected: 401 { "detail": "Invalid email or password" }
```

#### Duplicate Email Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123",
    "name": "Another User"
  }'
# Expected: 400 { "detail": "User with email ... already exists" }
```

#### Missing Required Fields
```bash
curl -X POST http://localhost:8000/api/complaints/create \
  -H "Authorization: Bearer <token>" \
  -F "location_lat=19.0760"
  # Missing location_lon, description, etc.
# Expected: 422 Validation error
```

#### Invalid Token
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 { "detail": "Invalid token" }
```

---

### 5. Performance Tests

#### Load Test (Simple)
```bash
# Test API response time (should be <200ms)
time curl -X GET http://localhost:8000/api/complaints/dashboard/stats

# Frontend load time
# Open DevTools → Network tab
# Reload page
# Check load time (should be <2s)
```

#### Database Test
```bash
# Check database connection
curl -X GET http://localhost:8000/health
# Should respond immediately
```

---

### 6. Mobile Responsive Tests

1. Open frontend in browser
2. Press F12 to open DevTools
3. Click device toolbar (mobile view)
4. Test breakpoints:
   - Mobile (375px): ✓ Single column layout
   - Tablet (768px): ✓ 2 column layout
   - Desktop (1024px+): ✓ Full layout
5. Test on specific devices:
   - iPhone 12: ✓ Functions correctly
   - iPad: ✓ Functions correctly
   - Galaxy S21: ✓ Functions correctly

---

### 7. Browser Compatibility Tests

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Chrome Mobile

All should:
- ✓ Load without errors
- ✓ Show all UI elements
- ✓ Function with geolocation
- ✓ Handle file upload

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Backend API Health | ✓/✗ | |
| User Registration | ✓/✗ | |
| User Login | ✓/✗ | |
| Create Complaint | ✓/✗ | |
| List Complaints | ✓/✗ | |
| Update Complaint | ✓/✗ | |
| Dashboard Stats | ✓/✗ | |
| Heatmap Data | ✓/✗ | |
| Frontend Home | ✓/✗ | |
| Report Issue Flow | ✓/✗ | |
| My Complaints | ✓/✗ | |
| Safety Map | ✓/✗ | |
| Dashboard | ✓/✗ | |
| Mobile Responsive | ✓/✗ | |
| Error Handling | ✓/✗ | |

---

## Known Limitations

1. **Heatmap**: Using simplified Leaflet overlay (not full heat visualization)
2. **Image Analysis**: Falls back to mock if Gemini API unavailable
3. **Location**: Fallback to Mumbai if geolocation blocked
4. **Real-time Updates**: No WebSocket implementation (future enhancement)
5. **Notifications**: No email/SMS notifications (future enhancement)

---

## Debugging Tips

### Backend Logs
```bash
docker logs nagarseva-backend
```

### Frontend Logs
```bash
# Check browser console (F12)
# Check network requests (DevTools → Network tab)
# Check Redux state (Redux DevTools extension)
```

### Database Inspection
```bash
docker exec nagarseva-postgres psql -U nagarseva -d nagarseva -c "SELECT * FROM complaints;"
```

### Reset Everything
```bash
docker-compose down -v
docker-compose up --build
```

---

## Success Criteria

All tests pass when:
- ✅ Backend API returns correct responses
- ✅ Frontend pages render without errors
- ✅ Image upload and processing works
- ✅ Location picker functions (GPS or manual)
- ✅ Complaints are created and stored in database
- ✅ Dashboard displays correct statistics
- ✅ Heatmap renders with complaint density
- ✅ Status tracking shows complaint timeline
- ✅ Filtering works on complaints list
- ✅ Mobile layout is responsive
- ✅ Error handling provides helpful messages

**When all criteria are met, MVP is ready for deployment! 🚀**
