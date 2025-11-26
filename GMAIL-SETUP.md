# 📧 Gmail SMTP Setup Guide

## ⚠️ IMPORTANT: You Need an App Password, Not Your Regular Gmail Password!

Gmail requires an **App Password** for SMTP access. Follow these steps:

---

## 🔐 Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/security
2. Under "How you sign in to Google", click **2-Step Verification**
3. Follow the prompts to enable it (if not already enabled)

---

## 🔑 Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Type: **GoalNet Backend**
6. Click **Generate**
7. **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

---

## ⚙️ Step 3: Update .env File

Open your `.env` file and update the SMTP_PASSWORD:

```bash
# Replace this line:
SMTP_PASSWORD=YOUR_16_CHAR_APP_PASSWORD_HERE

# With your actual app password (remove spaces):
SMTP_PASSWORD=abcdabcdabcdabcd
```

Your `.env` should look like:

```bash
# SMTP Email Configuration - Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@tracksense.ai
SMTP_PASSWORD=abcdabcdabcdabcd  # ← Your 16-char app password here
SMTP_FROM_NAME=GoalNet
SMTP_FROM_EMAIL=support@tracksense.ai
```

---

## ✅ Step 4: Test Email Integration

1. **Start MongoDB** (if not running):
   ```bash
   brew services start mongodb-community
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Test OTP email** using cURL:
   ```bash
   curl -X POST http://localhost:3000/auth/request-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "your-test-email@example.com"}'
   ```

4. **Check your email inbox** for the OTP email with beautiful HTML template!

---

## 🎨 Email Features Implemented

### OTP Email (sent when requesting OTP):
- ✅ Beautiful HTML template with GoalNet branding
- ✅ Large, easy-to-read OTP code
- ✅ Expiry time display
- ✅ Security warnings
- ✅ Professional footer
- ✅ Mobile responsive

### Welcome Email (sent to new users):
- ✅ Welcome message with GoalNet branding
- ✅ Feature highlights
- ✅ Call-to-action button
- ✅ Support information
- ✅ Professional design

---

## 🐛 Troubleshooting

### "SMTP Connection Error"
**Solution:** Make sure you:
1. Generated an **App Password** (not regular password)
2. Enabled 2-Step Verification first
3. Copied the app password correctly (no spaces)
4. Updated `.env` file with correct password

### "Invalid credentials"
**Solution:** 
- Double-check your `SMTP_USER` matches the Gmail account
- Regenerate App Password if needed
- Restart the server after updating `.env`

### Email not received
**Solution:**
- Check spam/junk folder
- Verify the recipient email is correct
- Check server logs for error messages
- Make sure your Gmail account can send emails

### "Authentication failed"
**Solution:**
- Your App Password may have expired
- Go back to https://myaccount.google.com/apppasswords
- Delete the old app password
- Generate a new one
- Update `.env` file

---

## 📝 Current Configuration

Your email is configured as:
- **From Name:** GoalNet
- **From Email:** support@tracksense.ai
- **SMTP Server:** smtp.gmail.com
- **Port:** 587 (TLS)
- **Security:** STARTTLS

---

## 🔄 Fallback Behavior

If email sending fails, the system will:
1. Log the error to console
2. In **development mode**: Print OTP to console as fallback
3. In **production mode**: Throw error (fail the request)

This ensures you can still test locally even if Gmail SMTP isn't configured yet!

---

## 🚀 Next Steps

1. Generate your Gmail App Password
2. Update `.env` with the app password
3. Restart the server
4. Test the OTP flow
5. Check your email inbox! 📬

---

## 📞 Support

If you encounter any issues:
- Check the server console for detailed error messages
- Verify all environment variables are set correctly
- Make sure MongoDB is running
- Restart the server after changing `.env`

**Email service will verify connection on startup** - check the console output!

✅ You should see: `Gmail SMTP Server is ready to send emails`

❌ If you see errors, follow the troubleshooting steps above.

---

**Happy emailing! 📧✨**
