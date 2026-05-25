# 🚀 Zar3a Platform - Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1️⃣ Install Dependencies

```bash
npm run setup
```

This installs all dependencies for both frontend and backend.

### 2️⃣ Set Up Database

Make sure MySQL is running, then:

```bash
cd "zar3a-backend copy"
npm run db:push
cd ..
```

### 3️⃣ Start Development

```bash
npm run dev
```

Both servers start automatically:
- 🎨 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:5000

## 📦 What You Get

| Service | URL | Technology |
|---------|-----|------------|
| Frontend | http://localhost:5173 | React + Vite + Tailwind |
| Backend | http://localhost:5000 | Express.js + Prisma |
| Database | localhost:3306 | MySQL |

## 🔄 Useful Commands

```bash
# Run both servers
npm run dev

# Run only backend
npm run backend

# Run only frontend
npm run frontend

# Build for production
npm run build

# View database UI
cd "zar3a-backend copy" && npm run db:studio
```

## 🆘 Need Help?

- See [SETUP.md](./SETUP.md) for detailed setup instructions
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for development guide

## ✅ Verify Everything Works

1. Open http://localhost:5173 in your browser
2. Try navigating to different pages
3. Open DevTools (F12) → Network tab
4. Check that API requests go to http://localhost:5000

If you see API responses, you're all set! 🎉

---

**Happy Coding! 🌱**
