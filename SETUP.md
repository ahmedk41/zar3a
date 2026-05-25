# Zar3a - Full Stack Agricultural Platform

Complete setup guide for the Zar3a fullstack project.

## 📋 Project Structure

```
Zar3a/                    # React Frontend
zar3a-backend copy/       # Node.js/Express Backend
```

## 🚀 Quick Start

### 1. Install All Dependencies

```bash
npm run setup
```

This will:
- Install root dependencies (concurrently)
- Install frontend dependencies
- Install backend dependencies

### 2. Start Development Servers

```bash
npm run dev
```

This will run both the backend and frontend concurrently:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 📦 Backend Setup

### Prerequisites
- Node.js 14+
- MySQL 8.0+

### Environment Variables
Backend uses `.env` file (already configured):
- `PORT=5000` - Backend server port
- `CLIENT_URL=http://localhost:5173` - Frontend URL for CORS
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` - Database credentials
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` - JWT secrets

### Database Setup

```bash
cd "zar3a-backend copy"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# View database in Prisma Studio
npm run db:studio
```

### Run Backend Only

```bash
npm run backend
```

Server will start at `http://localhost:5000`

## 🎨 Frontend Setup

### Environment Variables
Frontend uses `.env.local` file:
- `VITE_API_URL=http://localhost:5000` - Backend API URL

### Dependencies
- React 19
- Vite 7
- React Router DOM 7
- Axios for API calls
- Tailwind CSS
- React Hook Form
- Zod for validation

### Run Frontend Only

```bash
npm run frontend
```

App will start at `http://localhost:5173`

## 🔗 API Integration

### Axios Configuration
The frontend uses a configured axios instance in `src/API/axiosInstance.js`:
- Base URL: http://localhost:5000
- Auto-attaches JWT tokens from localStorage
- Auto-refreshes tokens on 401 responses

### Available Endpoints

#### Authentication Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Calling the API

```javascript
import api from "@/API/axiosInstance";

// Example: Login
const response = await api.post("/auth/login", {
  email: "user@example.com",
  password: "password123"
});
```

## 🛠️ Available Scripts

### Root Project
```bash
npm run dev                 # Run both backend and frontend
npm run setup              # Install all dependencies
npm run build              # Build both projects
npm run backend            # Run backend only
npm run frontend           # Run frontend only
```

### Backend
```bash
cd "zar3a-backend copy"
npm run dev                # Development with nodemon
npm start                  # Production
npm run db:migrate         # Run database migrations
npm run db:push            # Push schema to database
npm run db:generate        # Generate Prisma client
npm run db:studio          # Open Prisma Studio
```

### Frontend
```bash
cd Zar3a
npm run dev                # Development server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

## 🔐 Security Notes

- Change JWT secrets in `.env` before production
- Keep `.env` files private (add to `.gitignore`)
- Use environment-specific configurations
- Enable HTTPS in production

## 📁 Key Files

### Backend
- `src/server.js` - Server entry point
- `src/routes/auth.routes.js` - Authentication routes
- `prisma/schema.prisma` - Database schema
- `.env` - Environment configuration

### Frontend
- `src/main.jsx` - React entry point
- `src/routes/router.jsx` - Route configuration
- `src/API/axiosInstance.js` - API client
- `.env.local` - Frontend configuration

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check DB credentials in `.env`
- Run `npm run db:push` to sync schema

### CORS Errors
- Ensure `CLIENT_URL` matches frontend URL in backend `.env`
- Frontend should be at `http://localhost:5173`
- Backend should be at `http://localhost:5000`

### Port Already in Use
- Change `PORT` in backend `.env` (e.g., `PORT=5001`)
- Or kill existing process on the port

### Token Refresh Issues
- Check JWT secrets in backend `.env`
- Verify tokens are stored in localStorage
- Check browser DevTools Network tab

## 📚 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Axios Documentation](https://axios-http.com/)

## 📝 Next Steps

1. Configure database credentials in `zar3a-backend copy/.env`
2. Create MySQL database: `zar3a_db`
3. Run `npm run setup` to install dependencies
4. Run `npm run dev` to start development
5. Visit http://localhost:5173 in your browser

---

**Happy coding! 🌱**
