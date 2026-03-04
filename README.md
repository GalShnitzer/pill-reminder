# Pill Reminder App

A simple React + Node.js app to track daily pill intake with email reminders.

- Toggle "taken / not taken" for today
- Email reminder at **12:00 PM** if not taken
- Follow-up emails every **2 hours** (14:00, 16:00, 18:00, 20:00, 22:00)
- 7-day history

---

## Stack

| | Tech | Host |
|---|---|---|
| Frontend | React + Vite | Vercel |
| Backend | Node.js + Express + node-cron | Render |
| Database | PostgreSQL | Neon (free) |
| Email | Nodemailer + Gmail | — |

---

## Local Development

### 1. Database — Neon (free)

1. Sign up at https://neon.tech
2. Create a project → copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

### 2. Gmail App Password

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already on
3. Go to **App passwords** → create one (name it "Pill Reminder")
4. Copy the 16-character password

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

Backend runs at http://localhost:3001

**Test the email setup:**
```bash
curl -X POST http://localhost:3001/api/test-email
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

---

## Cloud Deployment

### Database → Neon
Already set up from the local dev step.

### Backend → Render

1. Push your code to GitHub (you can push the whole `pill-reminder/` folder)
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo, set:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `GMAIL_USER` | your.email@gmail.com |
| `GMAIL_APP_PASSWORD` | your 16-char app password |
| `REMINDER_EMAIL` | email to receive reminders |
| `DATABASE_URL` | your Neon connection string |
| `FRONTEND_URL` | https://your-app.vercel.app (fill after Vercel deploy) |

> **Important:** Use the **Hobby plan ($7/mo)** on Render for reliable cron scheduling.
> The free tier spins down after 15 minutes of inactivity, which means the 12:00 PM reminder may not fire.

### Frontend → Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo, set:
   - **Root directory**: `frontend`
3. Add **Environment Variable**:
   - `VITE_API_URL` = `https://your-render-service.onrender.com`
4. Deploy

---

## Project Structure

```
pill-reminder/
├── backend/
│   ├── server.js       # Express app, cron jobs, email
│   ├── db.js           # PostgreSQL queries
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx     # Main UI
    │   ├── App.css     # Styles
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```
