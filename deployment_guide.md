# Zar3a 🌱 Full-Stack Deployment Guide

This guide describes how to deploy the **Zar3a** Agricultural Platform live. 

We have prepared the repository configuration and code adjustments to ensure a smooth deployment.

---

## 🚀 Live Demo Architecture

- **Frontend (SPA React + Vite)**: Hosted on **Vercel** (highly recommended over GitHub Pages for React Router/Single Page Apps due to native rewrite routing).
- **Backend (Node.js/Express)**: Hosted on **Railway** or **Render**.
- **Database (MySQL)**: Hosted on **Railway** (native support) or **Aiven** / **Tidb Cloud** / **Render**.

---

## 📦 Stage 1: Frontend Deployment (Vercel)

Vercel provides automatic deployments on every `git push` to your repository.

### Steps to Deploy:
1. Go to [Vercel](https://vercel.com/) and log in with your GitHub account.
2. Click **Add New** → **Project**.
3. Import the `zar3a` repository.
4. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Root Directory**: Click *Edit* and select **`Zar3a`** (since the frontend code is in the `Zar3a` subdirectory).
5. **Configure Environment Variables**:
   - Add the following variable in Vercel project settings:
     * **`VITE_API_URL`**: Your live backend URL (e.g., `https://zar3a-backend.up.railway.app` or `https://zar3a-api.onrender.com`).
6. Click **Deploy**. Vercel will build and assign you a live `.vercel.app` URL.

> [!NOTE]
> We have preconfigured a [vercel.json](file:///Users/ahmed/Downloads/files/Zar3a/vercel.json) inside the `Zar3a` folder. This fixes any SPA routing issues (404 on page refresh) by automatically redirecting all routing requests to `index.html`.

---

## ⚙️ Stage 2: Backend & Database Deployment

You can choose either **Railway** (easiest for MySQL databases) or **Render**.

### Option A: Deployment on Railway (Recommended)
1. Go to [Railway](https://railway.app/) and sign in with GitHub.
2. Click **New Project** → **Provision MySQL** to spin up a live MySQL database.
3. Once the database is ready:
   - Click **New** → **GitHub Repo** → select the `zar3a` repository.
   - Go to the service settings on Railway and set the **Root Directory** / **Watch Paths** to **`zar3a-backend copy`**.
4. Go to **Variables** on the backend service and reference/define:
   - **`DATABASE_URL`**: `${{MySQL.DATABASE_URL}}` (Railway automatically links this).
   - **`PORT`**: `5002` (or let Railway assign it).
   - **`JWT_SECRET`**: `your_jwt_secret_here`
   - **`BREVO_API_KEY`**: `your_brevo_api_key`
   - **`STRIPE_SECRET_KEY`**: `your_stripe_secret_key`
   - **`STRIPE_WEBHOOK_SECRET`**: `your_stripe_webhook_secret`
5. Railway will build using the pre-existing [Dockerfile](file:///Users/ahmed/Downloads/files/zar3a-backend%20copy/Dockerfile) and launch the backend API.

---

### Option B: Deployment on Render
1. Go to [Render](https://render.com/) and sign in with GitHub.
2. **Setup Database**:
   - Create a **MySQL Instance** (you can use external free MySQL providers like Tidb Cloud or Aiven MySQL, then copy their connection URI).
3. **Setup Web Service**:
   - Click **New** → **Web Service** and connect the `zar3a` repository.
   - **Name**: `zar3a-backend`
   - **Root Directory**: `zar3a-backend copy`
   - **Runtime**: `Docker` (Render will automatically detect the [Dockerfile](file:///Users/ahmed/Downloads/files/zar3a-backend%20copy/Dockerfile)).
4. **Environment Variables**:
   - Go to **Environment** tab and add:
     * **`DATABASE_URL`**: Your MySQL connection string.
     * **`JWT_SECRET`**: `your_jwt_secret_here`
     * **`BREVO_API_KEY`**: `your_brevo_api_key`
     * **`STRIPE_SECRET_KEY`**: `your_stripe_secret_key`
     * **`STRIPE_WEBHOOK_SECRET`**: `your_stripe_webhook_secret`
5. Click **Deploy Web Service**.

---

## 🛠️ Deployment Configuration Checks Done:

1. **SPA Route Refresh**: Configured [vercel.json](file:///Users/ahmed/Downloads/files/Zar3a/vercel.json) to handle React Router client-side routing on reload.
2. **CORS Configuration**: Modified the backend CORS middleware in [server.js](file:///Users/ahmed/Downloads/files/zar3a-backend%20copy/src/server.js) to dynamically allow calls from `.vercel.app` domains, resolving cross-origin errors on live servers.
3. **Database URL Sync**: The database config file [database.js](file:///Users/ahmed/Downloads/files/zar3a-backend%20copy/src/config/database.js) is mapped to read the connection URL from `DATABASE_URL` dynamically.
