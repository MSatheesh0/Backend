# GoalNet Backend API - Complete Reference

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints except `/auth/*` and `/health` require JWT authentication.

**Header:**
```
Authorization: Bearer {token}
```

---

## 📋 Endpoints Overview

### Authentication (2)
- `POST /auth/request-otp` - Request OTP code
- `POST /auth/verify-otp` - Verify OTP and get token

### User Profile (2)
- `GET /me` - Get user profile
- `PUT /me` - Update user profile

### AI Profile (2)
- `GET /me/ai-profile` - Get AI-generated profile
- `POST /me/ai-profile/regenerate` - Regenerate AI profile

### Documents (3)
- `GET /me/documents` - List all documents
- `POST /me/documents` - Add document/link
- `DELETE /me/documents/:id` - Delete document

### Goals (4)
- `GET /me/goals` - List goals
- `POST /me/goals` - Create goal
- `PUT /me/goals/:id` - Update goal
- `DELETE /me/goals/:id` - Delete/archive goal

**Total: 13 endpoints**

---

## 🔐 Authentication Endpoints

### 1. Request OTP
```http
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "success": true
}
```

**Dev Mode:** OTP is always `123456`

---

### 2. Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUz...",
  "isNewUser": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "",
    "role": null,
    "primaryGoal": null
  }
}
```

---

## 👤 User Profile Endpoints

### 3. Get Profile
```http
GET /me
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "founder",
  "primaryGoal": "fundraising",
  "company": "My Startup",
  "website": "https://mystartup.com",
  "location": "Chennai, India",
  "oneLiner": "Building AI SaaS",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

---

### 4. Update Profile
```http
PUT /me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "role": "founder",
  "primaryGoal": "fundraising",
  "company": "My Startup",
  "website": "https://mystartup.com",
  "location": "Chennai, India",
  "oneLiner": "Building AI SaaS"
}
```

**All fields optional**

---

## 🤖 AI Profile Endpoints

### 5. Get AI Profile
```http
GET /me/ai-profile
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "summary": "Founder at TechVenture based in Chennai. Building AI SaaS. Currently working on 2 active goals with focus on fundraising.",
  "currentFocus": [
    "Raising funding for growth",
    "Raise Series A Funding",
    "Launch MVP to 1000 Users"
  ],
  "strengths": [
    "Entrepreneurship",
    "Product Development",
    "Team Building"
  ],
  "highlights": [
    "Founder at TechVenture",
    "Based in Chennai",
    "Completed 3 milestones",
    "Portfolio: https://mystartup.com"
  ],
  "lastGenerated": "2024-11-24T10:30:00.000Z"
}
```

**Auto-generated from:** User profile + Goals + Documents

---

### 6. Regenerate AI Profile
```http
POST /me/ai-profile/regenerate
Authorization: Bearer {token}
```

**Response 200:** Same as Get AI Profile + `message` field

**Use Case:** Call after updating profile, adding goals, or uploading documents

---

## 📄 Documents Endpoints

### 7. List Documents
```http
GET /me/documents
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "documents": [
    {
      "id": "doc_123",
      "title": "Pitch Deck Q4 2024",
      "type": "pdf",
      "url": "https://example.com/pitch.pdf",
      "fileSize": 2457600,
      "mimeType": "application/pdf",
      "description": "Latest investor pitch",
      "uploadedAt": "2024-11-20T10:00:00.000Z",
      "createdAt": "2024-11-20T10:00:00.000Z"
    }
  ]
}
```

---

### 8. Add Document
```http
POST /me/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Pitch Deck",
  "type": "pdf",
  "url": "https://example.com/pitch.pdf",
  "fileSize": 2457600,
  "mimeType": "application/pdf",
  "description": "Investor pitch deck"
}
```

**Required:** `title`, `type`, `url`  
**Optional:** `fileSize`, `mimeType`, `description`

**Valid Types:** `pdf`, `doc`, `docx`, `ppt`, `pptx`, `image`, `link`, `other`

---

### 9. Delete Document
```http
DELETE /me/documents/:id
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Document deleted successfully",
  "id": "doc_123"
}
```

---

## 🎯 Goals Endpoints

### 10. List Goals
```http
GET /me/goals
Authorization: Bearer {token}
```

**Query Params:**
- `status` (optional): `active`, `completed`, `archived`, `cancelled`
- Default: `active` goals only

**Response 200:**
```json
{
  "goals": [
    {
      "id": "goal_789",
      "title": "Raise Series A Funding",
      "description": "Target: $3M from VCs",
      "status": "active",
      "progress": 60,
      "targetDate": "2025-06-30T00:00:00.000Z",
      "milestones": [
        {
          "title": "Complete pitch deck",
          "completed": true,
          "completedAt": "2024-11-20T10:00:00.000Z"
        },
        {
          "title": "Schedule 20 meetings",
          "completed": false
        }
      ],
      "tags": ["fundraising", "series-a"],
      "createdAt": "2024-11-15T08:00:00.000Z",
      "updatedAt": "2024-11-24T10:30:00.000Z"
    }
  ]
}
```

---

### 11. Create Goal
```http
POST /me/goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Raise Series A",
  "description": "Target $3M",
  "targetDate": "2025-06-30",
  "milestones": [
    {
      "title": "Complete pitch deck",
      "completed": false
    }
  ],
  "tags": ["fundraising", "priority"]
}
```

**Required:** `title`  
**Optional:** `description`, `targetDate`, `milestones`, `tags`

---

### 12. Update Goal
```http
PUT /me/goals/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "progress": 75,
  "status": "active",
  "milestones": [
    {
      "title": "Complete pitch deck",
      "completed": true,
      "completedAt": "2024-11-20T10:00:00.000Z"
    }
  ]
}
```

**All fields optional**  
**Valid Status:** `active`, `completed`, `archived`, `cancelled`  
**Progress:** 0-100

---

### 13. Delete/Archive Goal
```http
DELETE /me/goals/:id
Authorization: Bearer {token}
```

**Query Params:**
- `archive=true` - Archive instead of delete

**Archive Response:**
```json
{
  "message": "Goal archived successfully",
  "id": "goal_789"
}
```

---

## 📊 Data Types & Enums

### Role
```
"founder" | "investor" | "mentor" | "cxo" | "service" | "other"
```

### Primary Goal
```
"fundraising" | "clients" | "cofounder" | "hiring" | "learn" | "other"
```

### Goal Status
```
"active" | "completed" | "archived" | "cancelled"
```

### Document Type
```
"pdf" | "doc" | "docx" | "ppt" | "pptx" | "image" | "link" | "other"
```

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

**Error Format:**
```json
{
  "error": "Error Type",
  "message": "Human-readable message"
}
```

---

## 🔄 Typical User Flow

1. **Authentication**
   - Request OTP → Verify OTP → Get Token

2. **First Login** (`isNewUser: true`)
   - Complete profile: `PUT /me`
   - Get AI profile: `GET /me/ai-profile`

3. **Add Goals**
   - Create goal: `POST /me/goals`
   - Update progress: `PUT /me/goals/:id`

4. **Upload Documents**
   - Add pitch deck: `POST /me/documents`
   - Add product demo: `POST /me/documents`

5. **Regenerate AI Profile**
   - After changes: `POST /me/ai-profile/regenerate`

6. **View Dashboard**
   - Get profile: `GET /me`
   - Get AI summary: `GET /me/ai-profile`
   - Get goals: `GET /me/goals`
   - Get documents: `GET /me/documents`

---

## ⏱️ Important Limits

- **JWT Token:** Valid for 30 days
- **OTP:** Valid for 10 minutes (6 digits)
- **Rate Limit:** 3 OTP requests per 5 minutes
- **Progress:** 0-100 range
- **Dev Mode OTP:** Always `123456`

---

## 🧪 Testing

**Files:**
- `extended-api-tests.http` - All 13 endpoints with examples
- `devtunnel-test.http` - Quick tests for DevTunnel
- `api-tests.http` - Original auth + profile tests

**Postman:** Import `GoalNet-API.postman_collection.json`

---

## 📱 Mobile Integration

See `MOBILE-API-GUIDE.md` for Flutter examples and `API-SPEC.json` for machine-readable spec.

---

**Questions?** Check backend logs or contact the team.
