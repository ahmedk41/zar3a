# OTP-Based Password Reset Flow - Complete Implementation Guide

## Overview

This is a production-ready OTP (One-Time Password) based password reset flow with three distinct steps:

```
Step 1: Request OTP → Step 2: Verify OTP → Step 3: Reset Password
```

---

## Architecture

### Backend Structure

```
Backend/
├── models/
│   ├── User.js (existing)
│   └── PasswordResetOTP.js (new)
├── controllers/
│   └── auth.controller.js (updated with 3 new functions)
├── routes/
│   └── auth.routes.js (updated with 3 new routes)
├── utils/
│   ├── auth.js (existing)
│   ├── mail.js (existing)
│   ├── otp.js (new - OTP generation & verification)
│   └── emailTemplates.js (new - email templates)
└── config/
    └── database.js (existing)
```

### Frontend Structure

```
Frontend/
└── src/pages/Auth/ForgotPassword/
    ├── ForgotPassword.jsx (main coordinator)
    ├── ForgotPasswordRequest.jsx (step 1)
    ├── OTPVerification.jsx (step 2)
    ├── ResetPasswordWithOTP.jsx (step 3)
    └── ForgotPassword.css (styling)
```

---

## Backend API Endpoints

### 1️⃣ Request OTP

**Endpoint:** `POST /auth/forgot-password/request-otp`

**Base URL:** `http://localhost:5001/api` (or your backend URL)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "message": "If an account with this email exists, an OTP has been sent.",
  "requestId": 123
}
```

**Response (Error - 400):**
```json
{
  "message": "Email is required"
}
```

**What Happens:**
- Checks if email exists in database
- Generates 6-digit OTP
- Hashes OTP for secure storage
- Stores with 10-minute expiration
- Sends OTP via email
- **Security:** Returns generic message whether email exists or not (prevents email enumeration attacks)

---

### 2️⃣ Verify OTP

**Endpoint:** `POST /auth/forgot-password/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success - 200):**
```json
{
  "message": "OTP verified successfully. Proceed to reset password.",
  "verificationToken": "abc123def456...",
  "expiresIn": 900
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**Response (Error - 429 - Too Many Attempts):**
```json
{
  "message": "Too many failed attempts. Please request a new OTP."
}
```

**What Happens:**
- Validates OTP against hashed version
- Checks if OTP has expired
- Implements brute-force protection (max 5 attempts)
- On success: Issues temporary `verificationToken` valid for 15 minutes
- Marks OTP record as verified

---

### 3️⃣ Reset Password

**Endpoint:** `POST /auth/forgot-password/reset-password`

**Request Body:**
```json
{
  "verificationToken": "abc123def456...",
  "newPassword": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Response (Error - 400):**
```json
{
  "message": "Passwords do not match"
}
```

**What Happens:**
- Validates verification token
- Hashes new password with bcrypt
- Updates user's passwordHash
- Deletes OTP record (cleanup)
- User can now login with new password

---

## Database Schema

### PasswordResetOTP Table

```sql
CREATE TABLE password_reset_otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(255) NOT NULL,          -- bcrypt hashed
  otp_attempts INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (email),
  INDEX (verification_token)
);
```

---

## Frontend Implementation

### Main Component Flow

```jsx
// App.jsx or Router
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';

// Add route
<Route path="/forgot-password" element={<ForgotPassword />} />
```

### Component Integration

```jsx
// In Login.jsx or similar
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Login form */}
      <button onClick={() => navigate('/forgot-password')}>
        Forgot Password?
      </button>
    </>
  );
};
```

### Step-by-Step User Flow

1. **Step 1 - Request OTP:**
   - User enters email
   - Frontend calls `POST /auth/forgot-password/request-otp`
   - User sees success message
   - Progress to Step 2

2. **Step 2 - Verify OTP:**
   - User enters 6-digit code (auto-focus between fields)
   - Frontend calls `POST /auth/forgot-password/verify-otp`
   - On success: Receive `verificationToken`
   - Progress to Step 3
   - User can request new OTP if needed

3. **Step 3 - Reset Password:**
   - User enters new password with strength indicator
   - Frontend calls `POST /auth/forgot-password/reset-password`
   - On success: Redirect to `/login`
   - User logs in with new password

---

## Security Features Implemented

### ✅ **OTP Security**
- 6-digit numeric OTP (1 million combinations)
- Hashed with bcrypt (never stored in plain text)
- 10-minute expiration
- Cannot be reused

### ✅ **Brute Force Protection**
- Maximum 5 failed OTP attempts
- Lockout after 5 attempts
- User must request new OTP

### ✅ **Email Enumeration Prevention**
- Generic response whether email exists or not
- Prevents attackers from harvesting valid emails

### ✅ **Temporary Verification Token**
- Issued after OTP verification
- Valid for 15 minutes only
- Cannot be used multiple times

### ✅ **Password Strength**
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers
- Optional special characters recommended
- Frontend strength indicator

### ✅ **Hashing**
- Passwords hashed with bcrypt (12 rounds)
- OTP hashed with bcrypt
- No plain text storage

---

## Environment Variables Required

```env
# .env file

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key

# Frontend
VITE_API_URL=http://localhost:3000/api

# Database
DATABASE_URL=mysql://user:password@localhost:3306/zar3a

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## Installation & Setup

### 1. Backend Setup

```bash
cd zar3a-backend\ copy

# Install dependencies (if not already done)
npm install bcryptjs crypto jwt

# Run migrations (if using Sequelize migration system)
npx sequelize-cli db:migrate

# Start server
npm start
```

### 2. Frontend Setup

```bash
cd Zar3

# Install dependencies (if not already done)
npm install axios react-router-dom

# Ensure .env has correct API URL
# VITE_API_URL=http://localhost:3000/api

# Start dev server
npm run dev
```

### 3. Update Router

Add route to your main router file:

```jsx
// src/routes/router.jsx or similar
import ForgotPassword from '../pages/Auth/ForgotPassword/ForgotPassword';

const routes = [
  // ... existing routes
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  }
];
```

---

## Testing the Flow

### Using cURL

```bash
# Step 1: Request OTP
curl -X POST http://localhost:3000/api/auth/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Step 2: Verify OTP (replace with actual OTP from email)
curl -X POST http://localhost:3000/api/auth/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# Step 3: Reset Password (use verificationToken from step 2)
curl -X POST http://localhost:3000/api/auth/forgot-password/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "verificationToken": "abc123def456...",
    "newPassword": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }'
```

### Using Postman

1. Create new collection: "Forgot Password OTP"
2. Add 3 requests with the URLs above
3. Use Environment variables for dynamic token storage

---

## UX/Enhancement Suggestions

### 🎯 Current Implementation
- ✅ 3-step wizard with progress indicator
- ✅ Email validation at each step
- ✅ Real-time password strength indicator
- ✅ OTP countdown timer
- ✅ Auto-focus between OTP input fields
- ✅ Responsive mobile design

### 🚀 Future Enhancements

1. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   # Limit OTP requests per IP/email
   ```

2. **Two-Factor Authentication (2FA)**
   - Optional SMS OTP in addition to email
   - SMS provider integration (Twilio, Vonage)

3. **Backup Codes**
   - Generate recovery codes if OTP fails
   - Store hashed in database

4. **Session Management**
   - Invalidate all active sessions after password reset
   - Require re-login on all devices

5. **Audit Logging**
   - Log password reset attempts
   - Track failed OTP attempts for security monitoring

6. **Email Verification**
   - Verify email before sending OTP
   - Prevent misspelled email abuse

7. **Account Recovery**
   - If user no longer has email access
   - Alternative verification methods

---

## Troubleshooting

### OTP Not Received
- Check Brevo API key and IP whitelist
- Verify email is correctly formatted
- Check spam/promotions folder

### Token Expired
- OTP: 10 minutes
- Verification Token: 15 minutes
- User must restart if either expires

### Too Many Attempts
- User locked out after 5 failed OTP attempts
- Must request new OTP

### Password Reset Fails
- Ensure verification token is valid
- Check password meets requirements (8+ chars)
- Passwords must match exactly

---

## Code Quality

- ✅ Clean separation of concerns (controllers, models, utils)
- ✅ Input validation on all endpoints
- ✅ Comprehensive error handling
- ✅ Security best practices (bcrypt hashing, OTP expiry, brute-force protection)
- ✅ Responsive mobile-first UI
- ✅ Accessibility considerations (labels, keyboard navigation)
- ✅ Well-commented code
- ✅ Production-ready error messages

---

## Support

For issues or questions:
1. Check logs for errors
2. Verify environment variables
3. Test individual endpoints with cURL
4. Ensure database is running
5. Check email service credentials

---

**Last Updated:** May 2024
**Version:** 1.0.0
**Production Ready:** ✅ Yes
