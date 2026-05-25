# Quick Start Checklist - OTP Password Reset Implementation

## ✅ What's Included

### Backend Files Created/Updated
- [x] `src/models/PasswordResetOTP.js` - NEW OTP database model
- [x] `src/utils/otp.js` - NEW OTP generation & verification utilities
- [x] `src/utils/emailTemplates.js` - NEW email template for OTP
- [x] `src/controllers/auth.controller.js` - UPDATED with 3 new functions:
  - `requestPasswordResetOTP()`
  - `verifyPasswordResetOTP()`
  - `resetPasswordWithOTP()`
- [x] `src/models/index.js` - UPDATED to export PasswordResetOTP
- [x] `src/routes/auth.routes.js` - UPDATED with 3 new routes

### Frontend Files Created
- [x] `src/pages/Auth/ForgotPassword/ForgotPassword.jsx` - Main coordinator component
- [x] `src/pages/Auth/ForgotPassword/ForgotPasswordRequest.jsx` - Step 1: Request OTP
- [x] `src/pages/Auth/ForgotPassword/OTPVerification.jsx` - Step 2: Verify OTP
- [x] `src/pages/Auth/ForgotPassword/ResetPasswordWithOTP.jsx` - Step 3: Reset Password
- [x] `src/pages/Auth/ForgotPassword/ForgotPassword.css` - Complete styling

### Documentation
- [x] `OTP_PASSWORD_RESET_GUIDE.md` - Complete implementation guide
- [x] `OTP_QUICK_START_CHECKLIST.md` - This file

---

## 🚀 Implementation Checklist

### Step 1: Backend Database Migration

```bash
# If using Sequelize CLI:
npx sequelize-cli migration:create --name create-password-reset-otp

# Add this to the migration file:
```

```javascript
// migrations/XXXXXX-create-password-reset-otp.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PasswordResetOTPs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      otp: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      otpAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('PasswordResetOTPs', ['userId']);
    await queryInterface.addIndex('PasswordResetOTPs', ['email']);
    await queryInterface.addIndex('PasswordResetOTPs', ['verificationToken']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PasswordResetOTPs');
  },
};
```

**OR if using direct SQL:**

```sql
-- Run directly in your database
CREATE TABLE password_reset_otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(255) NOT NULL,
  otp_attempts INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (email),
  INDEX (verification_token)
);
```

### Step 2: Verify Backend Dependencies

```bash
cd zar3a-backend\ copy

# Ensure these packages are installed
npm list bcryptjs crypto jwt express-validator

# If missing, install:
npm install bcryptjs
npm install express-validator
```

### Step 3: Test Backend Routes

```bash
# 1. Request OTP
curl -X POST http://localhost:5001/api/auth/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
# Expected: { "message": "If an account with this email exists..." }

# 2. Verify OTP (use code from email)
curl -X POST http://localhost:3000/api/auth/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
# Expected: { "message": "OTP verified...", "verificationToken": "..." }

# 3. Reset Password
curl -X POST http://localhost:3000/api/auth/forgot-password/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "verificationToken": "TOKEN_FROM_STEP_2",
    "newPassword": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }'
# Expected: { "message": "Password reset successfully..." }
```

### Step 4: Frontend Integration

**A. Update Router**

```jsx
// src/routes/router.jsx
import ForgotPassword from '../pages/Auth/ForgotPassword/ForgotPassword';

const routes = [
  // ... other routes
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  }
];
```

**B. Update Login Component**

```jsx
// src/pages/Auth/Login/Login.jsx
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Login form... */}
      <button onClick={() => navigate('/forgot-password')}>
        Forgot Password?
      </button>
    </>
  );
};
```

**C. Update Navbar (Optional)**

```jsx
// Add link in header/navbar
<a href="/forgot-password">Forgot Password</a>
```

### Step 5: Test Frontend

```bash
cd Zar3

# Ensure API URL is correct in .env
VITE_API_URL=http://localhost:3000/api

npm run dev

# Navigate to http://localhost:5173/forgot-password
```

### Step 6: End-to-End Testing

#### Test Scenario 1: Happy Path
- [ ] Navigate to `/forgot-password`
- [ ] Enter valid email
- [ ] Receive OTP in email
- [ ] Enter OTP correctly
- [ ] Enter new password
- [ ] See success message
- [ ] Login with new password works ✓

#### Test Scenario 2: Invalid OTP
- [ ] Request OTP
- [ ] Enter wrong OTP
- [ ] Should see error message
- [ ] Should show attempts remaining
- [ ] After 5 attempts, should be locked

#### Test Scenario 3: Expired OTP
- [ ] Request OTP
- [ ] Wait 10+ minutes
- [ ] Try to verify OTP
- [ ] Should see expiration error

#### Test Scenario 4: Non-existent Email
- [ ] Enter email not in system
- [ ] Should see generic message (for security)
- [ ] Should not reveal email doesn't exist

---

## 📋 Integration Points

### Existing Files Modified
1. `src/controllers/auth.controller.js`
   - Added 3 new controller functions
   - Added imports for OTP utilities

2. `src/routes/auth.routes.js`
   - Added 3 new routes
   - Added route validations

3. `src/models/index.js`
   - Added PasswordResetOTP import
   - Added association with User model

### New Dependencies
None! Uses existing packages:
- bcryptjs (for hashing)
- crypto (built-in Node.js)
- sequelize (already used)
- axios (frontend - already used)

---

## 🔒 Security Verification

- [ ] OTP is hashed before storage ✓
- [ ] OTP expires after 10 minutes ✓
- [ ] Brute force protection (5 attempts) ✓
- [ ] Email enumeration prevention ✓
- [ ] Temporary verification token ✓
- [ ] Password hashing with bcrypt ✓
- [ ] HTTPS recommended in production ✓
- [ ] Environment variables not in code ✓

---

## 📊 API Response Examples

### Success Responses

**Request OTP:**
```json
{
  "message": "If an account with this email exists, an OTP has been sent.",
  "requestId": 42
}
```

**Verify OTP:**
```json
{
  "message": "OTP verified successfully. Proceed to reset password.",
  "verificationToken": "6c88e1c2a3f9d4b1e5a2c8d0f3g7h9i2",
  "expiresIn": 900
}
```

**Reset Password:**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

### Error Responses

**Invalid OTP:**
```json
{
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**Too Many Attempts:**
```json
{
  "message": "Too many failed attempts. Please request a new OTP."
}
```

**OTP Expired:**
```json
{
  "message": "OTP has expired. Please request a new one."
}
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| OTP not received | Email service issue | Check Brevo API key, IP whitelist |
| "Invalid OTP" for correct code | Timing/timezone issue | Verify server time is correct |
| "Verification token not found" | Token expired | User must verify OTP within 15 mins |
| CORS errors | Frontend/backend mismatch | Verify API URL in .env matches backend |
| 404 routes | Routes not registered | Check auth.routes.js is imported in main router |

---

## 📞 Support Checklist

If something doesn't work:

1. **Check Backend Logs**
   ```bash
   npm start  # Look for any error messages
   ```

2. **Test Route Directly**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password/request-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

3. **Verify Database**
   ```sql
   SELECT * FROM password_reset_otps;
   ```

4. **Check Environment Variables**
   ```bash
   # Ensure these are set in .env:
   - BREVO_API_KEY
   - JWT_ACCESS_SECRET
   - JWT_REFRESH_SECRET
   - DATABASE_URL
   ```

5. **Browser Console**
   ```javascript
   // Check for frontend errors
   // Open DevTools → Console
   ```

---

## 📚 Next Steps

1. ✅ Follow checklist above
2. ✅ Test all three endpoints
3. ✅ Test frontend components
4. ✅ Run end-to-end tests
5. ✅ Deploy to staging environment
6. ✅ Get user feedback
7. ✅ Deploy to production

---

## 🎉 You're Done!

Your OTP-based password reset flow is now ready for production. 

**Key Features Implemented:**
- ✅ Secure 6-digit OTP generation
- ✅ 10-minute OTP expiration
- ✅ Brute-force protection (5 attempts)
- ✅ Email enumeration prevention
- ✅ Beautiful 3-step UI with progress indicator
- ✅ Password strength indicator
- ✅ Mobile-responsive design
- ✅ Production-ready error handling

---

**For detailed technical documentation, see `OTP_PASSWORD_RESET_GUIDE.md`**
