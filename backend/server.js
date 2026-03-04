require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Resend } = require('resend');
const { initDb, getTodayStatus, toggleToday, getHistory } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// ─── Email ───────────────────────────────────────────────────────────────────

async function sendReminderEmail(subject, body) {
  await resend.emails.send({
    from: 'Pill Reminder <onboarding@resend.dev>',
    to: process.env.REMINDER_EMAIL,
    subject,
    html: body,
  });
  console.log(`Email sent: ${subject}`);
}

// ─── Cron Jobs ───────────────────────────────────────────────────────────────

// Initial reminder at 12:00 PM every day (Israel time)
cron.schedule('0 12 * * *', async () => {
  const status = await getTodayStatus();
  if (!status.taken) {
    await sendReminderEmail(
      'Time to take your pill!',
      `<h2>Pill Reminder</h2>
       <p>It's 12:00 PM — don't forget to take your pill today!</p>
       <p><a href="${process.env.FRONTEND_URL}">Click here to mark it as taken</a></p>`
    );
  }
}, { timezone: 'Asia/Jerusalem' });

// Follow-up every 2 hours from 14:00 to 22:00 if not taken (Israel time)
cron.schedule('0 14,16,18,20,22 * * *', async () => {
  const status = await getTodayStatus();
  if (!status.taken) {
    const hour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })).getHours();
    await sendReminderEmail(
      `Reminder: Have you taken your pill? (${hour}:00)`,
      `<h2>Pill Reminder Follow-up</h2>
       <p>You haven't marked your pill as taken yet. Please take it as soon as possible!</p>
       <p><a href="${process.env.FRONTEND_URL}">Click here to mark it as taken</a></p>`
    );
  }
}, { timezone: 'Asia/Jerusalem' });

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/status', async (req, res) => {
  try {
    const status = await getTodayStatus();
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/toggle', async (req, res) => {
  try {
    const status = await toggleToday();
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const rows = await getHistory(7);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Test email endpoint — remove after testing
app.post('/api/test-email', async (req, res) => {
  try {
    await sendReminderEmail(
      'Test: Pill Reminder is working!',
      '<h2>It works!</h2><p>Your pill reminder email is configured correctly.</p>'
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to init database:', err);
    process.exit(1);
  });
