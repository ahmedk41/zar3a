/**
 * Email templates for password reset OTP flow
 */

export const otpEmailTemplate = (fullName, otp) => ({
  subject: '🔐 Your Zar3a Password Reset Code',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Password Reset Code</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { 
          background: #fef3c7; 
          border: 2px solid #f59e0b; 
          padding: 20px; 
          text-align: center; 
          border-radius: 8px; 
          margin: 25px 0;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #92400e;
          font-family: 'Courier New', monospace;
        }
        .warning { background: #fee2e2; border: 1px solid #f87171; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .expire-notice { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Code</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName},</h2>
          <p>We received a request to reset your Zar3a account password. Use this code to verify your identity:</p>
          
          <div class="otp-box">${otp}</div>
          
          <p style="text-align: center; color: #666;">
            <span class="expire-notice">⏱️ This code expires in 10 minutes</span>
          </p>
          
          <p>Enter this code on the password reset page. Do not share this code with anyone.</p>
          
          <div class="warning">
            <strong>⚠️ If you didn't request this code:</strong> Your account is safe. This code will expire in 10 minutes and cannot be reused. If you suspect suspicious activity, please contact our support team immediately.
          </div>
          
          <p style="font-size: 12px; color: #666;">
            For security reasons, never share this email or the code with anyone, including Zar3a support staff.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 Zar3a. All rights reserved.</p>
          <p>Empowering farmers, connecting markets.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `Hello ${fullName}, your password reset code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
});
