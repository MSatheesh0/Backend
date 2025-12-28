import nodemailer from "nodemailer";
import config from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });

    // Don't block server startup on email verification
    // Verify connection asynchronously
    setTimeout(() => this.verifyConnection(), 1000);
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Gmail SMTP Server is ready to send emails");
      console.log(`📧 Sending emails from: ${config.smtp.fromEmail}`);
    } catch (error) {
      console.warn(
        "⚠️  Gmail SMTP Connection Error - Email will fallback to console"
      );
      console.warn("   To enable email:");
      console.warn("   1. Verify SMTP_USER: support@tracksense.ai is correct");
      console.warn("   2. Enable 2-Step Verification in Gmail");
      console.warn(
        "   3. Generate NEW App Password at https://myaccount.google.com/apppasswords"
      );
      console.warn("   4. Update SMTP_PASSWORD in .env (remove all spaces)");
      console.warn("");
      console.warn(
        "   💡 Server will continue running - OTPs will be logged to console"
      );
    }
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #092537 0%, #0e4d64 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .logo {
              font-size: 36px;
              font-weight: bold;
              color: white;
              margin: 0;
            }
            .tagline {
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              margin-top: 5px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .otp-container {
              background: linear-gradient(135deg, #092537 0%, #0e4d64 100%);
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              box-shadow: 0 4px 6px rgba(9, 37, 55, 0.3);
            }
            .otp-label {
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 42px;
              font-weight: bold;
              color: white;
              letter-spacing: 10px;
              font-family: 'Courier New', monospace;
              margin: 10px 0;
            }
            .otp-expiry {
              color: rgba(255, 255, 255, 0.8);
              font-size: 13px;
              margin-top: 10px;
            }
            .warning-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
            .info-text {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
              margin: 15px 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer-text {
              color: #6c757d;
              font-size: 12px;
              margin: 5px 0;
            }
            @media only screen and (max-width: 600px) {
              .content {
                padding: 30px 20px;
              }
              .otp-code {
                font-size: 36px;
                letter-spacing: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1 class="logo">🎯 GoalNet</h1>
              <p class="tagline">Connect. Collaborate. Achieve.</p>
            </div>
            
            <div class="content">
              <p class="greeting">Hello there! 👋</p>
              
              <p class="info-text">
                Thank you for choosing <strong>GoalNet</strong>. We're excited to have you on board! 
                To complete your sign-in, please use the One-Time Password (OTP) below:
              </p>
              
              <div class="otp-container">
                <div class="otp-label">Your OTP Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-expiry">⏰ Expires in ${config.otpExpiryMinutes
      } minutes</div>
              </div>
              
              <div class="warning-box">
                <p>
                  <strong>⚠️ Security Notice:</strong> Never share this code with anyone. 
                  Our team will never ask for your OTP.
                </p>
              </div>
              
              <p class="info-text">
                If you didn't request this code, please ignore this email. 
                Your account security is important to us.
              </p>
              
              <p class="info-text">
                Need help? Reply to this email or contact us at 
                <a href="mailto:support@tracksense.ai" style="color: #0e4d64;">support@tracksense.ai</a>
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text"><strong>GoalNet</strong></p>
              <p class="footer-text">Empowering founders, investors, and professionals to achieve their goals</p>
              <p class="footer-text">© ${new Date().getFullYear()} GoalNet by TracSense. All rights reserved.</p>
              <p class="footer-text">This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
GoalNet - Your One-Time Password
================================

Hello!

Thank you for choosing GoalNet. To complete your sign-in, please use the following OTP:

YOUR OTP CODE: ${otp}

⏰ This code expires in ${config.otpExpiryMinutes} minutes.

SECURITY NOTICE: Never share this code with anyone. Our team will never ask for your OTP.

If you didn't request this code, please ignore this email.

Need help? Contact us at support@tracksense.ai

---
© ${new Date().getFullYear()} GoalNet by TracSense. All rights reserved.
    `;

    try {
      await this.sendEmail({
        to: email,
        subject: `🎯 Your GoalNet OTP: ${otp}`,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✅ OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send OTP email to ${email}:`, error);
      // Fallback to console for development
      console.log(`\n📧 [FALLBACK] OTP for ${email}: ${otp}\n`);
      throw new Error("Failed to send OTP email");
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const displayName = name || "there";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #092537 0%, #0e4d64 100%);
              padding: 50px 20px;
              text-align: center;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .header-title {
              font-size: 32px;
              font-weight: bold;
              color: white;
              margin: 10px 0;
            }
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome-text {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .feature-box {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .feature-item {
              display: flex;
              align-items: flex-start;
              margin: 15px 0;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 15px;
              flex-shrink: 0;
            }
            .feature-text {
              flex: 1;
            }
            .feature-title {
              font-weight: 600;
              color: #333;
              margin-bottom: 5px;
            }
            .feature-desc {
              color: #666;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #092537 0%, #0e4d64 100%);
              color: white;
              padding: 15px 40px;
              border-radius: 30px;
              text-decoration: none;
              font-weight: 600;
              margin: 30px 0;
              box-shadow: 0 4px 6px rgba(9, 37, 55, 0.3);
            }
            .cta-container {
              text-align: center;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer-text {
              color: #6c757d;
              font-size: 12px;
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="logo">🎯</div>
              <h1 class="header-title">Welcome to GoalNet!</h1>
              <p class="header-subtitle">Let's achieve great things together</p>
            </div>
            
            <div class="content">
              <p class="welcome-text">Hi ${displayName}! 👋</p>
              
              <p>
                We're thrilled to have you join the <strong>GoalNet</strong> community! 
                You're now part of a network of ambitious founders, investors, mentors, 
                and professionals working towards their goals.
              </p>
              
              <div class="feature-box">
                <div class="feature-item">
                  <div class="feature-icon">✅</div>
                  <div class="feature-text">
                    <div class="feature-title">Complete Your Profile</div>
                    <div class="feature-desc">Tell us about yourself, your role, and what you're looking to achieve</div>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">🎯</div>
                  <div class="feature-text">
                    <div class="feature-title">Set Your Goals</div>
                    <div class="feature-desc">Define your objectives - fundraising, hiring, finding co-founders, or learning</div>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">🤝</div>
                  <div class="feature-text">
                    <div class="feature-title">Connect & Collaborate</div>
                    <div class="feature-desc">Network with like-minded professionals who can help you succeed</div>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">🚀</div>
                  <div class="feature-text">
                    <div class="feature-title">Track Your Progress</div>
                    <div class="feature-desc">Monitor your journey and celebrate your achievements</div>
                  </div>
                </div>
              </div>
              
              <div class="cta-container">
                <a href="${config.frontendUrl
      }" class="cta-button">Get Started Now →</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Need assistance? Our support team is here to help! 
                Reach out at <a href="mailto:support@tracksense.ai" style="color: #667eea;">support@tracksense.ai</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">
                Looking forward to seeing you achieve amazing things! 🌟
              </p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The GoalNet Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text"><strong>GoalNet by TracSense</strong></p>
              <p class="footer-text">Empowering your professional journey</p>
              <p class="footer-text" style="margin-top: 15px;">
                © ${new Date().getFullYear()} GoalNet. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.sendEmail({
        to: email,
        subject: "🎉 Welcome to GoalNet - Let's Get Started!",
        html: htmlContent,
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${email}:`, error);
      // Don't throw - welcome email is not critical
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
