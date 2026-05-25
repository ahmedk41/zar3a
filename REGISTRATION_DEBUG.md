# 🔧 Registration Error - Debugging Guide

## Issues Fixed ✅

### 1. **Port Mismatch**
- **Problem**: Backend was running on port 5001, frontend configured for port 5000
- **Solution**: Changed backend port to 5000 in `server.js`

### 2. **Prisma Schema Mismatch**
- **Problem**: Prisma schema was missing `username` and `phone` fields required by the API
- **Solution**: Updated Prisma schema to match Sequelize models

## 🔍 How to Debug Registration Issues

### Step 1: Verify Backend is Running

```bash
# Test backend connectivity
curl http://localhost:5000

# Expected response:
# {"status":"ok","project":"Zar3a API 🌱","version":"1.0.0"}
```

### Step 2: Check MySQL Connection

```bash
# Verify MySQL is running
mysql -u root

# Create database if needed
CREATE DATABASE zar3a_db;
EXIT;
```

### Step 3: Verify Environment Variables

Backend `.env` file must have:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zar3a_db
DB_USER=root
DB_PASS=
DATABASE_URL="mysql://root:@localhost:3306/zar3a_db"
PORT=5000
CLIENT_URL=http://localhost:5173
```

Frontend `.env.local` must have:
```
VITE_API_URL=http://localhost:5000
```

### Step 4: Check Backend Logs

When you run `npm run dev` in the backend folder, you should see:
```
✅ Database connected & synced
🌱 Zar3a API is running
    Local  →  http://localhost:5000
```

If you see an error like:
- `getaddrinfo ENOTFOUND` → MySQL is not running or host is wrong
- `Error: listen EADDRINUSE` → Port 5000 is already in use

## 🧪 Test Registration Endpoint Manually

### Using cURL

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'

# Expected response:
# {"userId": 1}
```

### Using REST Client (VS Code Extension)

Create `test.http` file:

```http
### Test Backend Health
GET http://localhost:5000

### Register User
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "username": "testuser1",
  "email": "test1@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

## 🚀 Restart Everything Fresh

If issues persist, follow these steps:

### 1. Stop all services
```bash
# Stop npm dev
Ctrl+C

# Kill any lingering processes
lsof -i :5000
lsof -i :5173
```

### 2. Clear database (WARNING: Deletes all data)
```bash
mysql -u root
DROP DATABASE zar3a_db;
CREATE DATABASE zar3a_db;
EXIT;
```

### 3. Restart backend with logging
```bash
cd "zar3a-backend copy"
npm run dev
```

Watch for these messages:
```
✅ Database connected & synced
🌱 Zar3a API is running
    Local  →  http://localhost:5000
```

### 4. In another terminal, start frontend
```bash
cd Zar3a
npm run dev
```

## 📊 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `error: Registration failed. Please try again.` | Backend endpoint not responding or database error | Check backend is running, MySQL is connected |
| `CORS error` | Frontend URL not in CORS whitelist | Verify `CLIENT_URL` in backend `.env` |
| `network error: fetch failed` | Backend not reachable | Check `VITE_API_URL` in frontend `.env.local` |
| `Email already registered` | User already exists | Try different email address |
| `Username already taken` | Username already exists | Try different username |
| `connect ECONNREFUSED 127.0.0.1:3306` | MySQL not running | Start MySQL service |

## 🔗 Check Network in Browser DevTools

1. Open Frontend: http://localhost:5173
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Try registration
5. Click the failed request (should be POST /auth/register)
6. Check:
   - **Status Code**: Should be 201 (success) or 4xx/5xx (error)
   - **Request Headers**: Should include `Authorization: Bearer ...`
   - **Response**: Should show error message
   - **URL**: Should be `http://localhost:5000/auth/register`

## 🆘 Still Having Issues?

Check these files in order:

1. **Frontend sending wrong data**: `Zar3a/src/pages/Auth/Register/Register.jsx`
2. **Axios not configured**: `Zar3a/src/API/axiosInstance.js`
3. **Backend endpoint missing**: `zar3a-backend copy/src/routes/auth.routes.js`
4. **Controller logic wrong**: `zar3a-backend copy/src/controllers/auth.controller.js`
5. **Database connection**: `zar3a-backend copy/src/config/database.js`
6. **Models not synced**: `zar3a-backend copy/src/models/User.js`

## 📝 Next Steps After Fix

Once registration works:

1. ✅ Test login
2. ✅ Test role selection
3. ✅ Test profile completion based on role
4. ✅ Test token refresh
5. ✅ Test logout

---

**If problem persists after these steps, run `npm run dev` and share the exact error message!**
