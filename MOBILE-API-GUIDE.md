# GoalNet Backend API - Mobile Integration Guide

## Base Configuration
```
Base URL: http://localhost:3000 (Development)
Base URL: https://api.goalnet.app (Production - TBD)
Content-Type: application/json
```

---

## Authentication Flow

### Step 1: Request OTP
**Endpoint:** `POST /auth/request-otp`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Errors:**
- `400 Bad Request` - Invalid email format
- `429 Too Many Requests` - Rate limit exceeded (3 requests per 5 minutes)
- `500 Internal Server Error` - Server error

---

### Step 2: Verify OTP & Get Token
**Endpoint:** `POST /auth/verify-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "",
    "role": null,
    "primaryGoal": null,
    "company": null,
    "website": null,
    "location": null,
    "oneLiner": null
  }
}
```

**Fields:**
- `token` (string) - JWT token, valid for 30 days
- `isNewUser` (boolean) - `true` if this is first login (account just created)
- `user` (object) - User profile data

**Errors:**
- `400 Bad Request` - Invalid or expired OTP
- `500 Internal Server Error` - Server error

**Important:**
- OTP is valid for 10 minutes
- OTP can only be used once (consumed after verification)
- If `isNewUser: true`, redirect to profile completion screen
- If `isNewUser: false`, user already has account, proceed to main app
- Store JWT token securely (keychain/secure storage)

---

## User Profile Management

### Get Current User Profile
**Endpoint:** `GET /me`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
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
  "oneLiner": "AI SaaS for manufacturing analytics",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Missing, invalid, or expired token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### Update User Profile
**Endpoint:** `PUT /me`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request (all fields optional):**
```json
{
  "name": "John Doe",
  "role": "founder",
  "primaryGoal": "fundraising",
  "company": "My Startup",
  "website": "https://mystartup.com",
  "location": "Chennai, India",
  "oneLiner": "AI SaaS for manufacturing analytics"
}
```

**Response (200 OK):**
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
  "oneLiner": "AI SaaS for manufacturing analytics",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid role or primaryGoal value
- `401 Unauthorized` - Missing, invalid, or expired token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## Health Check
**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

Use this to check if backend is reachable.

---

## Data Types & Enums

### User Object
```typescript
{
  id: string,              // MongoDB ObjectId
  email: string,           // User's email (unique)
  name: string,            // Full name (optional)
  role?: string,           // User role (enum)
  primaryGoal?: string,    // Primary goal (enum)
  company?: string,        // Company name (optional)
  website?: string,        // Website URL (optional)
  location?: string,       // Location/city (optional)
  oneLiner?: string,       // Brief description (optional)
  createdAt: string,       // ISO 8601 date
  updatedAt: string        // ISO 8601 date
}
```

### Role Enum
```typescript
type Role = 
  | "founder"    // Startup founder
  | "investor"   // Angel investor, VC
  | "mentor"     // Mentor, advisor
  | "cxo"        // CXO, executive
  | "service"    // Service provider
  | "other"      // Other
```

### Primary Goal Enum
```typescript
type PrimaryGoal = 
  | "fundraising"  // Raising funds
  | "clients"      // Finding clients
  | "cofounder"    // Finding co-founder
  | "hiring"       // Hiring team
  | "learn"        // Learning/networking
  | "other"        // Other goals
```

---

## Mobile App Flow

### 1. **First Launch / Not Authenticated**
```
Show Login Screen
  ↓
User enters email
  ↓
Call: POST /auth/request-otp
  ↓
Show OTP Input Screen
  ↓
User enters OTP
  ↓
Call: POST /auth/verify-otp
  ↓
Store JWT token securely
  ↓
If isNewUser === true:
  → Show Profile Completion Screen
  → Call: PUT /me with profile data
  → Navigate to Main App
Else:
  → Navigate to Main App directly
```

### 2. **App Already Authenticated**
```
Check if JWT token exists
  ↓
If exists:
  → Call: GET /me to verify token & get profile
  → If 401: Token expired, show Login Screen
  → If 200: Navigate to Main App
Else:
  → Show Login Screen
```

### 3. **Profile Update**
```
Show Profile Edit Screen
  ↓
User modifies fields
  ↓
Call: PUT /me with changed fields only
  ↓
Update local state with response
  ↓
Show success message
```

---

## Authentication Implementation

### Store Token Securely
```dart
// Flutter example
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save token
await storage.write(key: 'jwt_token', value: token);

// Read token
String? token = await storage.read(key: 'jwt_token');

// Delete token (logout)
await storage.delete(key: 'jwt_token');
```

### Add Token to Requests
```dart
// Flutter example with http package
import 'package:http/http.dart' as http;

final token = await storage.read(key: 'jwt_token');

final response = await http.get(
  Uri.parse('$baseUrl/me'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```

### Handle Token Expiration
```dart
if (response.statusCode == 401) {
  // Token expired or invalid
  await storage.delete(key: 'jwt_token');
  // Navigate to login screen
  Navigator.pushReplacementNamed(context, '/login');
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Common Error Codes
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Handle Errors Gracefully
```dart
try {
  final response = await http.post(/*...*/);
  
  if (response.statusCode == 200) {
    // Success
    final data = jsonDecode(response.body);
  } else if (response.statusCode == 400) {
    // Bad request - show error to user
    final error = jsonDecode(response.body);
    showError(error['message']);
  } else if (response.statusCode == 401) {
    // Unauthorized - logout user
    logout();
  } else if (response.statusCode == 429) {
    // Rate limited - show retry later message
    showError('Too many attempts. Please try again later.');
  } else {
    // Other errors
    showError('Something went wrong. Please try again.');
  }
} catch (e) {
  // Network error
  showError('Network error. Check your connection.');
}
```

---

## Rate Limiting

**OTP Requests:** 
- Max 3 requests per email per 5 minutes
- Returns `429 Too Many Requests` if exceeded

**Best Practice:**
- Show countdown timer after OTP request
- Disable "Resend OTP" button for 60 seconds
- Show clear error message if rate limited

---

## Security Best Practices

1. **Store JWT Securely**
   - Use platform secure storage (Keychain/Keystore)
   - Never store in shared preferences or local storage

2. **HTTPS Only**
   - Always use HTTPS in production
   - Reject insecure connections

3. **Token Expiration**
   - JWT expires after 30 days
   - Handle 401 errors gracefully
   - Re-authenticate user when token expires

4. **Validate Email**
   - Validate email format on client before API call
   - Show clear error messages

5. **OTP Input**
   - Use secure numeric keyboard
   - Auto-read OTP from SMS if possible
   - Clear OTP input on error

6. **Network Errors**
   - Show retry options
   - Cache profile data locally
   - Handle offline mode gracefully

---

## Testing Endpoints

### Development Server
```
Base URL: http://localhost:3000
```

### Test Credentials
```
Email: test@example.com
OTP: Check backend console for generated OTP
```

### Postman Collection
Import `GoalNet-API.postman_collection.json` for testing

### REST Client (VS Code)
Use `quick-test.http` for quick API testing

---

## API Versioning
Current Version: v1 (implicit, no version prefix)
Future: `/v1/auth/request-otp` format will be used

---

## Support
- Backend GitHub: [Repository URL]
- API Issues: [Issues URL]
- Documentation: README.md, QUICKSTART.md

---

## Example: Complete Mobile Integration (Flutter)

```dart
// services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:3000'; // Change for production
  final storage = const FlutterSecureStorage();

  // Request OTP
  Future<bool> requestOTP(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/request-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 429) {
        throw Exception('Too many requests. Please try again later.');
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Failed to send OTP');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Save token
        await storage.write(key: 'jwt_token', value: data['token']);
        await storage.write(key: 'user_email', value: email);
        
        return data;
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Invalid OTP');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Get Profile
  Future<Map<String, dynamic>> getProfile() async {
    final token = await storage.read(key: 'jwt_token');
    
    if (token == null) {
      throw Exception('Not authenticated');
    }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await logout();
        throw Exception('Session expired');
      } else {
        throw Exception('Failed to get profile');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Update Profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    final token = await storage.read(key: 'jwt_token');
    
    if (token == null) {
      throw Exception('Not authenticated');
    }

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(profileData),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await logout();
        throw Exception('Session expired');
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Logout
  Future<void> logout() async {
    await storage.delete(key: 'jwt_token');
    await storage.delete(key: 'user_email');
  }

  // Check if authenticated
  Future<bool> isAuthenticated() async {
    final token = await storage.read(key: 'jwt_token');
    return token != null;
  }
}
```

---

**Ready for Mobile Integration! 📱✨**
