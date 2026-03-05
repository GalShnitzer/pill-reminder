# Pill Reminder App

<img src="docs/screenshot.png" width="350" alt="Pill Reminder App" />

A simple React + Node.js app to track daily pill intake with email reminders.

- Toggle "taken / not taken" for today
- Email reminder at **12:00 PM** if not taken
- Follow-up emails every **2 hours** (14:00, 16:00, 18:00, 20:00, 22:00)
- 7-day history
- All times in **Israel timezone (Asia/Jerusalem)**

---

## Live Deployment

| | URL |
|---|---|
| Frontend | https://pill-reminder.vercel.app |
| Backend | https://pill-reminder-1lkh.onrender.com |

---

## Stack

| | Tech | Host |
|---|---|---|
| Frontend | React + Vite | Vercel (free) |
| Backend | Node.js + Express + node-cron | Render (free) |
| Database | PostgreSQL | Neon (free) |
| Email | Resend | — |
| Uptime monitor | UptimeRobot | — |

---

## Cloud Deployment

### 1. Database → Neon

1. Sign up at https://neon.tech
2. Create a project → copy the **Connection String** (`postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. The `pill_logs` table is created automatically on first server start (`initDb()` in `db.js`)

### 2. Email → Resend

1. Sign up at https://resend.com
2. Go to **API Keys** → create a new key
3. On the free tier, emails can only be sent **to the email you signed up with**
4. To send to a different address, verify a domain in Resend settings

### 3. Backend → Render

1. Go to https://render.com → **New Web Service**
2. Connect your GitHub repo, set:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
   - **Instance type**: Free
3. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | your Resend API key |
| `REMINDER_EMAIL` | email to receive reminders |
| `DATABASE_URL` | your Neon connection string |
| `FRONTEND_URL` | https://your-app.vercel.app (fill after Vercel deploy) |

### 4. Frontend → Vercel

1. Go to https://vercel.com → **New Project**
2. Import your GitHub repo, set:
   - **Root directory**: `frontend`
3. Add **Environment Variable**:
   - `VITE_API_URL` = your Render service URL
4. Deploy → copy the URL and set it as `FRONTEND_URL` on Render

### 5. Uptime Monitor → UptimeRobot (keeps Render free tier awake)

Render's free tier spins down after 15 minutes of inactivity, which would cause the cron jobs to miss their scheduled time.

1. Sign up at https://uptimerobot.com (free)
2. **Add New Monitor**:
   - Type: **HTTP(s)**
   - URL: `https://your-render-service.onrender.com/api/status`
   - Interval: **5 minutes**

This keeps the server alive 24/7 so reminders always fire on time.

---

## Local Development

### Backend

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

---

## Future Plans

- **Multi-user support** — allow multiple users with individual accounts and pill tracking
- **Email logs** — keep a history of all sent reminder emails per user
- **Multiple pills** — manage more than one pill per day with individual tracking
- **Configurable reminders** — let users set their own reminder times and frequency
- **Configurable email** — let users set the recipient email from the app settings

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
