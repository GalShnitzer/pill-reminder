const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pill_logs (
      date DATE PRIMARY KEY,
      taken BOOLEAN DEFAULT FALSE,
      taken_at TIMESTAMP
    )
  `);
  console.log('Database ready');
}

async function getTodayStatus() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const { rows } = await pool.query(
    `INSERT INTO pill_logs (date) VALUES ($1)
     ON CONFLICT (date) DO NOTHING
     RETURNING *`,
    [today]
  );
  if (rows.length > 0) return rows[0];
  const result = await pool.query('SELECT * FROM pill_logs WHERE date = $1', [today]);
  return result.rows[0];
}

async function toggleToday() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const { rows } = await pool.query(
    `INSERT INTO pill_logs (date, taken, taken_at)
     VALUES ($1, TRUE, NOW())
     ON CONFLICT (date) DO UPDATE
       SET taken = NOT pill_logs.taken,
           taken_at = CASE WHEN NOT pill_logs.taken THEN NOW() ELSE NULL END
     RETURNING *`,
    [today]
  );
  return rows[0];
}

async function getHistory(days = 7) {
  const { rows } = await pool.query(
    `SELECT date, taken, taken_at
     FROM pill_logs
     WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
     ORDER BY date DESC`
  );
  return rows;
}

module.exports = { initDb, getTodayStatus, toggleToday, getHistory };
