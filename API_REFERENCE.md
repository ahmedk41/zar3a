# API Reference - OTP Password Reset Endpoints

## Base URL
```
http://localhost:5001/api
```

**Note:** Update this to match your backend URL (default: localhost:5001)

---

## Endpoint 1: Request OTP

### Request
```http
POST /auth/forgot-password/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Success Response (200 OK)
```json
{
  "message": "If an account with this email exists, an OTP has been sent.",
  "requestId": 42
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Email is required"
}
```

### Validation Errors (422 Unprocessable Entity)
```json
{
  "errors": [
    {
      "value": "invalid-email",
      "msg": "Valid email required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### cURL Example
```bash
curl -X POST http://localhost:5001/api/auth/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### JavaScript/Axios Example
```javascript
const response = await axios.post(
  'http://localhost:3000/api/auth/forgot-password/request-otp',
  { email: 'user@example.com' }
);
console.log(response.data);
```

### Frontend Integration
```jsx
const handleRequestOTP = async (email) => {
  try {
    const { data } = await axios.post(
      `${process.env.VITE_API_URL}/auth/forgot-password/request-otp`,
      { email }
    );
    // Success - move to next step
    onOTPRequested(email);
  } catch (error) {
    // Show error message
    setError(error.response?.data?.message);
  }
};
```

---

## Endpoint 2: Verify OTP

### Request
```http
POST /auth/forgot-password/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Success Response (200 OK)
```json
{
  "message": "OTP verified successfully. Proceed to reset password.",
  "verificationToken": "6c88e1c2a3f9d4b1e5a2c8d0f3g7h9i2j5k8l1m4n7o0p3q6r9s2t5u8v",
  "expiresIn": 900
}
```

### Invalid OTP (400 Bad Request)
```json
{
  "message": "Invalid OTP. 4 attempts remaining."
}
```

### Too Many Attempts (429 Too Many Requests)
```json
{
  "message": "Too many failed attempts. Please request a new OTP."
}
```

### OTP Expired (400 Bad Request)
```json
{
  "message": "OTP has expired. Please request a new one."
}
```

### Validation Errors (422)
```json
{
  "errors": [
    {
      "msg": "Valid email required",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "OTP is required",
      "param": "otp",
      "location": "body"
    }
  ]
}
```

### cURL Example
```bash
curl -X POST http://localhost:5001/api/auth/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

### JavaScript/Axios Example
```javascript
const response = await axios.post(
  'http://localhost:3000/api/auth/forgot-password/verify-otp',
  { 
    email: 'user@example.com', 
    otp: '123456' 
  }
);
// Use verificationToken for next step
const { verificationToken } = response.data;
```

### Frontend Integration
```jsx
const handleVerifyOTP = async (email, otp) => {
  try {
    const { data } = await axios.post(
      `${process.env.VITE_API_URL}/auth/forgot-password/verify-otp`,
      { email, otp }
    );
    
    // Success - save token for next step
    setVerificationToken(data.verificationToken);
    onOTPVerified(data.verificationToken);
  } catch (error) {
    const message = error.response?.data?.message;
    // Show error or attempts remaining
    setError(message);
  }
};
```

---

## Endpoint 3: Reset Password

### Request
```http
POST /auth/forgot-password/reset-password
Content-Type: application/json

{
  "verificationToken": "6c88e1c2a3f9d4b1e5a2c8d0f3g7h9i2j5k8l1m4n7o0p3q6r9s2t5u8v",
  "newPassword": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

### Success Response (200 OK)
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

### Invalid Token (400 Bad Request)
```json
{
  "message": "Invalid or expired verification token"
}
```

### Password Mismatch (400 Bad Request)
```json
{
  "message": "Passwords do not match"
}
```

### Weak Password (400 Bad Request)
```json
{
  "message": "Password must be at least 8 characters"
}
```

### Validation Errors (422)
```json
{
  "errors": [
    {
      "msg": "Verification token is required",
      "param": "verificationToken",
      "location": "body"
    },
    {
      "msg": "Password must be at least 8 characters",
      "param": "newPassword",
      "location": "body"
    }
  ]
}
```

### cURL Example
```bash
curl -X POST http://localhost:5001/api/auth/forgot-password/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "verificationToken": "6c88e1c2a3f9d4b1e5a2c8d0f3g7h9i2j5k8l1m4n7o0p3q6r9s2t5u8v",
    "newPassword": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

### JavaScript/Axios Example
```javascript
const response = await axios.post(
  'http://localhost:3000/api/auth/forgot-password/reset-password',
  {
    verificationToken,
    newPassword: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  }
);
console.log(response.data.message);
// Redirect to login
```

### Frontend Integration
```jsx
const handleResetPassword = async (newPassword, confirmPassword) => {
  try {
    const { data } = await axios.post(
      `${process.env.VITE_API_URL}/auth/forgot-password/reset-password`,
      {
        verificationToken,
        newPassword,
        confirmPassword
      }
    );
    
    // Success
    alert('Password reset successfully! Redirecting to login...');
    navigate('/login');
  } catch (error) {
    setError(error.response?.data?.message);
  }
};
```

---

## Complete Flow Example (JavaScript)

```javascript
// Step 1: Request OTP
const requestOTP = async (email) => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    console.log(data.message); // "If an account with this email exists..."
  } catch (error) {
    console.error('Error:', error);
  }
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    
    if (!res.ok) {
      console.error(data.message); // "Invalid OTP. 4 attempts remaining."
      return;
    }
    
    const verificationToken = data.verificationToken;
    console.log('OTP verified! Token:', verificationToken);
    return verificationToken;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Step 3: Reset Password
const resetPassword = async (verificationToken, newPassword, confirmPassword) => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationToken,
        newPassword,
        confirmPassword
      })
    });
    const data = await res.json();
    
    if (!res.ok) {
      console.error(data.message);
      return false;
    }
    
    console.log(data.message); // "Password reset successfully..."
    return true;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
(async () => {
  const email = 'user@example.com';
  
  // Step 1
  await requestOTP(email);
  
  // User receives OTP in email, enters it here
  const otp = '123456';
  
  // Step 2
  const token = await verifyOTP(email, otp);
  
  if (token) {
    // Step 3
    const success = await resetPassword(token, 'NewPassword123!', 'NewPassword123!');
    if (success) {
      console.log('Password reset complete!');
      // Redirect to login
    }
  }
})();
```

---

## Error Status Codes

| Code | Meaning | Response |
|------|---------|----------|
| 200 | Success | `{ message, verificationToken?, requestId? }` |
| 400 | Bad Request | `{ message }` |
| 422 | Validation Error | `{ errors: [...] }` |
| 429 | Too Many Attempts | `{ message }` |
| 500 | Server Error | `{ message: "Server error" }` |

---

## Rate Limiting Recommendations

For production, add rate limiting:

```javascript
// In Express app
import rateLimit from 'express-rate-limit';

// Limit OTP requests to 3 per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests, please try again later'
});

// Limit OTP verification to 10 attempts per 15 minutes
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many verification attempts'
});

router.post('/forgot-password/request-otp', otpLimiter, requestPasswordResetOTP);
router.post('/forgot-password/verify-otp', verifyLimiter, verifyPasswordResetOTP);
```

---

## Testing with Postman

1. Create new request
2. Set method to POST
3. Set URL to endpoint above
4. Go to Body → raw → JSON
5. Paste request body
6. Click Send

**Pro Tip:** Use environment variables in Postman to store API URL:
```
{{api_url}}/auth/forgot-password/request-otp
```

---

## Security Headers (Recommended)

Add these headers to all responses:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Common Issues & Status Codes

### OTP Not Verified?
- ❌ 400: OTP has expired
- ❌ 429: Too many attempts (locked)
- ❌ 400: Invalid OTP

**Solution:** Request new OTP

### Verification Token Invalid?
- ❌ 400: Token expired (15 minute window)
- ❌ 400: Invalid token format

**Solution:** Verify OTP again to get new token

### Password Reset Failed?
- ❌ 400: Passwords don't match
- ❌ 400: Password too short (< 8 chars)
- ❌ 400: Invalid verification token

**Solution:** Check password requirements, verify token is fresh

---

## Summary Table

| Step | Endpoint | Method | Body | Response |
|------|----------|--------|------|----------|
| 1 | `/forgot-password/request-otp` | POST | `{email}` | `{message, requestId}` |
| 2 | `/forgot-password/verify-otp` | POST | `{email, otp}` | `{message, verificationToken, expiresIn}` |
| 3 | `/forgot-password/reset-password` | POST | `{verificationToken, newPassword, confirmPassword}` | `{message}` |

---

**Ready to integrate? Copy-paste the examples above into your code!**
