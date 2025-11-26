# GoalNet Backend

A modern backend built with Node.js, TypeScript, Express, and MongoDB for the GoalNet application.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication tokens
- **Bcrypt** - OTP hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your values:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure secret key for JWT signing
   - `OTP_EXPIRY_MINUTES` - OTP expiration time (default: 10)
   - `OTP_CODE_LENGTH` - Number of digits in OTP (default: 6)

3. **Start MongoDB:**
   ```bash
   # If running locally
   mongod
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Authentication

#### Request OTP
```http
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

### User Profile

#### Get Current User
```http
GET /me
Authorization: Bearer <token>
```

Response:
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
  "oneLiner": "AI SaaS for manufacturing analytics"
}
```

#### Update Current User
```http
PUT /me
Authorization: Bearer <token>
Content-Type: application/json

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

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

## 🏗️ Project Structure

```
src/
├── config/           # Configuration and environment variables
├── middleware/       # Express middleware (auth, etc.)
├── models/           # Mongoose models
├── routes/           # API routes
├── services/         # Business logic
├── types/            # TypeScript type definitions
└── server.ts         # Entry point
```

## 🔐 Authentication Flow

1. User enters email → `POST /auth/request-otp`
2. OTP is generated, hashed, and stored
3. OTP is logged to console (in development)
4. User submits OTP → `POST /auth/verify-otp`
5. If valid:
   - Existing user → sign in
   - New user → create account
6. JWT token is returned

## 🔒 Security Features

- Helmet.js for security headers
- CORS protection
- JWT token expiration (30 days)
- OTP hashing with bcrypt
- Rate limiting for OTP requests (3 per 5 minutes)
- Automatic OTP expiration
- Generic error messages (no information leakage)

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Type check without building

## 🚧 TODO / Future Enhancements

- [ ] Integrate real email service (SendGrid, AWS SES, etc.)
- [ ] Add Redis for rate limiting and session management
- [ ] Implement IP-based rate limiting
- [ ] Add request validation middleware (express-validator)
- [ ] Add comprehensive error handling
- [ ] Add unit and integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add logging service (Winston, Pino)
- [ ] Add monitoring and observability
- [ ] Implement refresh tokens

## 📄 License

ISC
