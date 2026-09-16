
# 🚀 Vercel Deployment Guide

Your project is now configured for deployment on Vercel. Follow these steps to deploy both the Frontend (Client) and Backend (Server).

## 1. Preparation

Ensure you have your environment variables ready. You will need them during the Vercel setup.

**Backend (`server`) Variables:**
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_ACCESS_SECRET`: A random strong secret key for login.
- `JWT_REFRESH_SECRET`: Another random strong secret key.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads.
- `NODE_ENV`: Set to `production`.
- `CLIENT_URL`: Your deployed Frontend URL (e.g. `https://kuch-v.vercel.app`).

**Frontend (`client`) Variables:**
- `VITE_API_URL`: The URL of your deployed Backend (you will get this after deploying the server).

---

## 2. Deploying the Backend (Server)

1.  Login to **Vercel Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your Git Repository.
4.  **Important**: Configure the Project Settings:
    *   **Root Directory**: Click "Edit" and select `server`.
    *   **Framework Preset**: Select "Other" or "Express" (usually "Other" is fine as we have a `vercel.json`).
5.  **Environment Variables**:
    *   Add all the Backend variables listed above (`MONGO_URI`, `JWT_SECRET`, etc.).
6.  Click **Deploy**.

**After Deployment:**
*   Copy the URL assigned to your project (e.g., `https://kuch-v-server.vercel.app`).
*   This is your **Backend URL**.

### ⚠️ A Note on Real-Time Features
Vercel Serverless Functions do **not** support persistent WebSocket connections.
*   **Notifications**: Real-time popups might not work reliably. They rely on "polling" in this environment.
*   **Daily Profits**: I have configured a **Cron Job** (`/api/investments/process-profits`) to run daily at midnight automatically on Vercel. This will keep your investment plans working!

---

## 3. Deploying the Frontend (Client)

1.  Go back to **Vercel Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the **SAME** Git Repository again.
4.  **Important**: Configure the Project Settings:
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Framework Preset**: Vercel should auto-detect "Vite". If not, select "Vite".
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your **Backend URL** from Step 2 with `/api` at the end (e.g., `https://kuch-v-server.vercel.app/api`).
    *   **IMPORTANT**: You **MUST** append `/api`. Do not add a trailing slash after api (e.g. use `.../api`, not `.../api/`).
6.  Click **Deploy**.

---

## 4. Final Testing

1.  Open your deployed Client URL.
2.  Try to **Login/Register** (tests Database connection).
3.  Go to **Deposit** (tests Cloudinary).
4.  Go to **Portfolio** (tests API fetch).

Your app should now be live! 
