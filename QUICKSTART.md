# 🚀 Quick Start Guide

## Setup Instructions

### 1. Install Dependencies
Already completed! Dependencies installed successfully.

### 2. Configure MongoDB

You have two options:

#### Option A: Local MongoDB
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/goalnet?retryWrites=true&w=majority
   ```

### 3. Update Environment Variables

Edit the `.env` file:

```bash
# IMPORTANT: Change JWT_SECRET for production!
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Test the API

#### Test Health Check
```bash
curl http://localhost:3000/health
```

#### Request OTP
```bash
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Check your terminal for the OTP (it will be logged to console).

#### Verify OTP
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

Replace `123456` with the OTP from console.

#### Get User Profile
```bash
# Use the token from verify-otp response
curl http://localhost:3000/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update User Profile
```bash
curl -X PUT http://localhost:3000/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "role": "founder",
    "primaryGoal": "fundraising",
    "company": "My Startup",
    "location": "Chennai, India"
  }'
```

## 📂 Project Structure

```
goalnet/
├── src/
│   ├── config/
│   │   └── index.ts                 # Environment configuration
│   ├── middleware/
│   │   └── authMiddleware.ts        # JWT authentication middleware
│   ├── models/
│   │   ├── User.ts                  # User model
│   │   └── OtpRequest.ts            # OTP request model
│   ├── routes/
│   │   ├── authRoutes.ts            # Auth endpoints
│   │   └── userRoutes.ts            # User profile endpoints
│   ├── services/
│   │   └── authService.ts           # Auth business logic
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   └── server.ts                    # Main entry point
├── .env                              # Environment variables (not in git)
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # Full documentation

```

## 🔑 Key Features Implemented

### ✅ Authentication Module
- Email + OTP passwordless authentication
- OTP generation with configurable length
- OTP hashing with bcrypt
- OTP expiration (10 minutes default)
- Rate limiting (3 requests per 5 minutes)
- JWT token generation (30-day validity)
- Automatic user creation on first login

### ✅ User Profile Module
- Get current user profile (GET /me)
- Update user profile (PUT /me)
- Fields: name, role, primaryGoal, company, website, location, oneLiner
- Protected routes with JWT middleware

### ✅ Security Features
- Helmet.js for security headers
- CORS protection
- JWT authentication
- Password hashing with bcrypt
- Generic error messages (no info leakage)
- Rate limiting for OTP requests

### ✅ Developer Experience
- TypeScript with strict mode
- Hot reload with ts-node-dev
- Clean modular architecture
- Comprehensive error handling
- Request logging
- Graceful shutdown handling

## 🧪 Testing the Authentication Flow

1. **Request OTP:**
   - Send email to `/auth/request-otp`
   - Check terminal for OTP code
   - OTP valid for 10 minutes

2. **Verify OTP:**
   - Send email + OTP to `/auth/verify-otp`
   - Receive JWT token
   - Get `isNewUser: true` for new accounts

3. **Access Protected Routes:**
   - Use JWT token in Authorization header
   - Access `/me` to get/update profile

## 📝 Next Steps

### Recommended Enhancements:
1. **Email Integration:**
   - Integrate SendGrid, AWS SES, or similar
   - Replace console.log with actual email sending
   - Add email templates

2. **Testing:**
   - Add Jest for unit tests
   - Add Supertest for API testing
   - Test coverage for critical paths

3. **Monitoring:**
   - Add Winston or Pino for logging
   - Add error tracking (Sentry)
   - Add performance monitoring

4. **API Documentation:**
   - Add Swagger/OpenAPI
   - Generate API docs automatically

5. **Validation:**
   - Add express-validator
   - Enhance input validation

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `brew services list`
- Check connection string in `.env`
- For Atlas, check IP whitelist settings

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill`

### TypeScript Errors
- Run `npm run type-check` to see all errors
- Ensure all dependencies are installed: `npm install`

## 🎉 You're All Set!

Your backend is now ready for development. The OTP auth system is working, and you can start building additional features like goals, circles, connections, etc.

For any issues, check:
- Server logs in terminal
- MongoDB connection status
- Environment variables in `.env`

Happy coding! 🚀
