# GoalNet - Development & Production Mode Guide

## 🔧 Configuration

### Environment Variables (.env)

```env
# Mode Configuration
APP_MODE=development          # Options: development | production
DEBUG_MODE=true              # Enable detailed API logging (true/false)
```

---

## 🛠️ Development Mode

### Enable Development Mode
```env
APP_MODE=development
DEBUG_MODE=true
```

### Features

#### 1. **Static OTP**
- OTP is always: `123456`
- No email sending required
- Instant testing without email setup

#### 2. **Console Logging**
- OTP codes printed to console
- No SMTP configuration needed
- Easy debugging

#### 3. **Debug API Logging** (when DEBUG_MODE=true)
When enabled, logs detailed information for every API request:

**Request Information:**
- HTTP Method & Path
- Timestamp & IP address
- Full URL
- Headers (sensitive headers hidden)
- Query parameters
- Route parameters
- Request body (sensitive fields masked)
- Authenticated user info

**Response Information:**
- Response status code
- Response duration (ms)
- Response body (tokens truncated)
- Error details (if any)

**Example Debug Output:**
```
================================================================================
🔵 [DEBUG] POST /auth/request-otp
================================================================================
⏰ Timestamp: 2024-11-24T10:30:00.000Z
🌐 IP: ::1
📍 Full URL: http://localhost:3000/auth/request-otp

📋 Headers:
  content-type: application/json
  authorization: ******************** (hidden)

📦 Request Body:
{
  "email": "test@example.com"
}

--------------------------------------------------------------------------------
✅ Response Status: 200
⏱️  Duration: 45ms

📤 Response Body:
{
  "success": true
}
================================================================================
```

#### 4. **Startup Information**
Detailed configuration logged on server start:
- Current mode (Development/Production)
- Debug status
- Port & MongoDB URI
- Email configuration
- Available features

---

## 🚀 Production Mode

### Enable Production Mode
```env
APP_MODE=production
DEBUG_MODE=false
```

### Features

#### 1. **Random OTP**
- Generates unique 6-digit OTP for each request
- Secure and unpredictable
- Expires after configured time (default: 10 minutes)

#### 2. **Email via SMTP**
- Sends OTP via configured email service
- Beautiful HTML email templates
- Fallback to error if email fails
- Requires valid SMTP configuration:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@domain.com
  SMTP_PASSWORD=your-app-password
  ```

#### 3. **Minimal Logging**
- Only essential logs
- No sensitive data in logs
- Performance optimized
- Reduced console noise

#### 4. **Security Enhancements**
- JWT validation
- Rate limiting enforced
- No debug information exposed
- Production-ready error messages

---

## 🔄 Switching Between Modes

### Development → Production

1. **Update .env:**
   ```env
   APP_MODE=production
   DEBUG_MODE=false
   ```

2. **Configure SMTP:**
   - Set up Gmail App Password or SMTP service
   - Update all SMTP_* variables in .env

3. **Test OTP Flow:**
   - Request OTP → Check email
   - Verify OTP works with emailed code

4. **Update JWT Secret:**
   ```env
   JWT_SECRET=your-production-secret-key-min-32-chars
   ```

5. **Restart Server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

### Production → Development

1. **Update .env:**
   ```env
   APP_MODE=development
   DEBUG_MODE=true
   ```

2. **Restart Server:**
   ```bash
   npm run dev
   ```

3. **Use Static OTP:**
   - All OTP requests → Use `123456`

---

## 📊 Debug Mode Options

### Full Debug (Recommended for Development)
```env
APP_MODE=development
DEBUG_MODE=true
```
- Logs all API requests/responses
- Static OTP
- Console email logging

### Development Without Debug
```env
APP_MODE=development
DEBUG_MODE=false
```
- Static OTP
- Minimal console logs
- Faster for bulk testing

### Production Without Debug (Recommended)
```env
APP_MODE=production
DEBUG_MODE=false
```
- Real OTP via email
- Minimal logging
- Production-ready

### Production With Debug (Troubleshooting Only)
```env
APP_MODE=production
DEBUG_MODE=true
```
- Real OTP via email
- Full API logging
- Use only for debugging production issues

---

## 🧪 Testing Scenarios

### Local Development
```env
APP_MODE=development
DEBUG_MODE=true
```
- Use REST Client `.http` files
- OTP: `123456`
- See detailed logs for debugging

### Pre-Production Testing
```env
APP_MODE=production
DEBUG_MODE=true
```
- Test with real email
- Monitor all API calls
- Verify SMTP working

### Production Deployment
```env
APP_MODE=production
DEBUG_MODE=false
NODE_ENV=production
```
- Real OTP emails
- Minimal logs
- Optimized performance

---

## ⚠️ Important Notes

### Security
- **Never commit .env file to git**
- **Use strong JWT_SECRET in production**
- **DEBUG_MODE=false in production** (except troubleshooting)
- **Rotate SMTP passwords regularly**

### Performance
- Debug logging adds ~10-30ms per request
- Disable in production for optimal performance
- Health check endpoint excluded from debug logs

### Email
- Gmail requires App Password (not regular password)
- Generate at: https://myaccount.google.com/apppasswords
- Enable 2-Step Verification first
- Use 16-character app password (no spaces)

### Rate Limiting
- 3 OTP requests per 5 minutes (both modes)
- Prevents abuse
- User-friendly error messages

---

## 🐛 Troubleshooting

### Debug Logs Not Showing
```bash
# Check .env
cat .env | grep DEBUG_MODE
# Should show: DEBUG_MODE=true

# Restart server
npm run dev
```

### Static OTP Not Working
```bash
# Check mode
cat .env | grep APP_MODE
# Should show: APP_MODE=development

# Check server startup logs for:
# "📧 Email Mode: STATIC OTP (123456)"
```

### Production OTP Not Sending
```bash
# Check SMTP config
cat .env | grep SMTP

# Test email connection
# Server logs should show:
# "✅ Gmail SMTP Server is ready to send emails"

# If error, regenerate App Password
```

---

## 📝 Best Practices

1. **Development:** Always use `DEBUG_MODE=true` for easier debugging
2. **Testing:** Use `.http` files with REST Client extension
3. **Production:** Set `DEBUG_MODE=false` for performance
4. **Email:** Test email in pre-production environment first
5. **Logs:** Monitor logs during first production deployment
6. **Secrets:** Use environment-specific .env files
7. **Documentation:** Keep this guide updated with new features

---

## 🚦 Quick Reference

| Scenario | APP_MODE | DEBUG_MODE | OTP | Email |
|----------|----------|------------|-----|-------|
| Local Dev | development | true | 123456 | Console |
| Testing | development | false | 123456 | Console |
| Pre-Prod | production | true | Random | SMTP |
| Production | production | false | Random | SMTP |

---

**Questions?** Check server startup logs for current configuration.
