# Development Environment Setup

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com/))

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Zar3a)                     │
│              React + Vite + React Router                │
│                  http://localhost:5173                  │
└────────────────────────┬────────────────────────────────┘
                         │
                    Axios API Calls
                         │
┌────────────────────────▼────────────────────────────────┐
│           Backend (zar3a-backend copy)                  │
│        Express.js + Prisma + MySQL                      │
│                  http://localhost:5000                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   MySQL Database                        │
│                    zar3a_db                             │
└─────────────────────────────────────────────────────────┘
```

## 💻 Local Development Setup

### Step 1: Clone and Navigate

```bash
cd /path/to/project
```

### Step 2: Create MySQL Database

```bash
mysql -u root
CREATE DATABASE zar3a_db;
EXIT;
```

### Step 3: Install All Dependencies

```bash
npm run setup
```

### Step 4: Start Development Servers

```bash
npm run dev
```

Your terminal should show:
```
> concurrently "npm run dev:backend" "npm run dev:frontend"

[0] 
[0] ✅ Database connected & synced
[0] 🌱 Zar3a API is running
[0]     Local  →  http://localhost:5000
[1] 
[1]   VITE v7.x.x  ready in xxx ms
[1]
[1]   ➜  Local:   http://localhost:5173/
```

## 🐳 Docker Development Setup

### Prerequisites
- Docker ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose

### Start with Docker

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MySQL: localhost:3306

View logs:
```bash
docker-compose logs -f
```

Stop services:
```bash
docker-compose down
```

## 🔄 Development Workflow

### Making API Requests

```javascript
import api from "@/API/axiosInstance";

// Automatically includes Bearer token from localStorage
const response = await api.post("/auth/login", {
  email: "user@example.com",
  password: "password123"
});
```

### Adding New Backend Routes

1. Create controller in `zar3a-backend copy/src/controllers/`
2. Create routes in `zar3a-backend copy/src/routes/`
3. Add route to `src/server.js`
4. Restart backend

### Adding New Frontend Pages

1. Create page component in `Zar3a/src/pages/`
2. Add route to `Zar3a/src/routes/router.jsx`
3. Frontend auto-refreshes with Vite HMR

## 📊 Database Management

### Prisma Studio (Visual DB Editor)

```bash
cd "zar3a-backend copy"
npm run db:studio
```

Opens at http://localhost:5555

### Database Migrations

```bash
cd "zar3a-backend copy"

# Create migration
npm run db:migrate

# Push schema without creating migration
npm run db:push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🔑 Environment Variables

### Backend (.env)
Already configured, but you may need to adjust:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=        # Your MySQL password
DATABASE_URL="mysql://root:password@localhost:3306/zar3a_db"
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
```

### Frontend (.env.local)
Already configured:
```
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing API Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:5000

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Using VS Code REST Client

Install "REST Client" extension and create `.http` file:

```http
### Health Check
GET http://localhost:5000

### Login
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 📱 Hot Reload

- **Frontend**: Automatic with Vite (saves auto-refresh)
- **Backend**: Automatic with nodemon (auto-restarts on file changes)

## 🐛 Debugging

### Backend Debugging

```bash
cd "zar3a-backend copy"
node --inspect src/server.js
```

Then open `chrome://inspect` in Chrome.

### Frontend Debugging

- Open DevTools (F12 or Cmd+I)
- Use React DevTools extension
- Use Network tab to inspect API calls

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| `MySQL connection refused` | Ensure MySQL is running: `sudo service mysql status` |
| `Port 5000 already in use` | Change `PORT` in `.env` or kill process: `lsof -i :5000` |
| `Port 5173 already in use` | Change Vite port in `vite.config.js` |
| `CORS errors` | Check `CLIENT_URL` matches frontend URL in backend `.env` |
| `Prisma client not found` | Run `cd zar3a-backend\ copy && npm run db:generate` |
| `Token invalid` | Check JWT secrets are consistent in `.env` |

## 📚 Project Structure

```
├── zar3a-backend copy/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middlewares
│   │   └── server.js        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── .env                 # Backend config
│
├── Zar3a/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route config
│   │   ├── API/             # API client
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React context
│   │   └── main.jsx         # Entry point
│   ├── .env.local           # Frontend config
│   └── vite.config.js       # Vite config
│
└── package.json             # Root npm scripts
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Creates optimized builds in:
- `Zar3a/dist/` - Production-ready frontend
- Backend ready to run

### Environment Variables for Production

Update before deployment:
```bash
# Backend .env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
JWT_ACCESS_SECRET=long-random-string
JWT_REFRESH_SECRET=long-random-string

# Frontend .env.local
VITE_API_URL=https://api.yourdomain.com
```

## 💬 Support

For issues or questions:
1. Check the [SETUP.md](./SETUP.md) file
2. Review error messages in terminal
3. Check browser console (DevTools)
4. Verify environment variables
5. Ensure all services are running

---

**Happy Coding! 🌱**
