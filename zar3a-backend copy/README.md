# 🌱 Zar3a Backend — Node.js + MySQL

## 📁 Project Structure

```
zar3a-backend/
├── prisma/
│   └── schema.prisma          ← Database schema (MySQL)
├── src/
│   ├── config/
│   │   └── prisma.js          ← Prisma client singleton
│   ├── controllers/
│   │   └── auth.controller.js ← All auth logic
│   ├── middlewares/
│   │   ├── authenticate.js    ← JWT Bearer guard
│   │   └── upload.js          ← Multer CV upload (PDF/DOC, max 5MB)
│   ├── routes/
│   │   └── auth.routes.js     ← Routes + request validation
│   ├── utils/
│   │   └── auth.js            ← JWT helpers + bcrypt
│   └── server.js              ← Express entry point
├── frontend/
│   ├── api.js                 ← Drop into your React project
│   └── test.html              ← Open in browser to test all endpoints
├── uploads/
│   └── cv/                    ← Uploaded CV files stored here
├── .env                       ← ⚠️  Fill in your credentials
├── package.json
└── README.md
```

---

## ⚡ Quick Start (3 steps)

### 1. Fill in your `.env`

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/zar3a_db"
JWT_ACCESS_SECRET="any-random-secret"
JWT_REFRESH_SECRET="another-random-secret"
```

### 2. Create the MySQL database

```sql
CREATE DATABASE zar3a_db;
```

### 3. Install, migrate & run

```bash
npm install
npx prisma db push      # creates all tables in MySQL
npm run dev             # starts server on http://localhost:3000
```

---

## 🔗 API Endpoints

| Method | Route                     | Auth? | Description                        |
|--------|---------------------------|-------|------------------------------------|
| POST   | /auth/register/partner    | ✗     | Register Agro-Partner              |
| POST   | /auth/register/expert     | ✗     | Register Agro-Expert + CV upload   |
| POST   | /auth/login               | ✗     | Email/password login               |
| POST   | /auth/google              | ✗     | Google OAuth login                 |
| POST   | /auth/refresh             | ✗     | Rotate refresh token               |
| POST   | /auth/logout              | ✗     | Revoke refresh token               |
| GET    | /auth/me                  | ✓     | Get current user profile           |

---

## 🧪 Testing

**Option A — Browser tester** (no tools needed):
```
Open  frontend/test.html  directly in your browser
```

**Option B — React integration**:
```
Copy  frontend/api.js  →  your-react-app/src/services/api.js
Add   VITE_API_URL=http://localhost:3000  to your frontend .env
```

```js
import { authAPI } from "./services/api";

await authAPI.login("ahmed@test.com", "password123");
const user = await authAPI.me();
await authAPI.logout();
```

---

## 🗄️ Database Tables (auto-created by Prisma)

| Table                  | Purpose                              |
|------------------------|--------------------------------------|
| `users`                | Core user record (both roles)        |
| `agro_partner_profiles`| Extra data for Farmers/Buyers        |
| `agro_expert_profiles` | Degree, experience, CV path          |
| `refresh_tokens`       | JWT rotation store                   |
