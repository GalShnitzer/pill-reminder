import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function formatDate(dateStr) {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch(`${API}/api/status`),
        fetch(`${API}/api/history`),
      ]);
      if (!statusRes.ok || !historyRes.ok) throw new Error('Server error');
      setStatus(await statusRes.json());
      setHistory(await historyRes.json());
      setError(null);
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await fetch(`${API}/api/toggle`, { method: 'POST' });
      if (!res.ok) throw new Error('Toggle failed');
      const updated = await res.json();
      setStatus(updated);
      setHistory((prev) =>
        prev.map((row) =>
          row.date === updated.date ? updated : row
        )
      );
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setToggling(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const taken = status?.taken ?? false;

  return (
    <div className="app">
      <header>
        <h1>💊 Pill Reminder</h1>
        <p className="date">{formatDate(today)}</p>
      </header>

      <main>
        {loading && <div className="loader">Loading...</div>}

        {error && (
          <div className="error-box">
            {error}
            <button onClick={fetchStatus}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className={`status-card ${taken ? 'taken' : 'not-taken'}`}>
              <div className="status-icon">{taken ? '✅' : '⏰'}</div>
              <div className="status-text">
                <span className="status-label">
                  {taken ? "You've taken your pill today!" : "Haven't taken your pill yet"}
                </span>
                {taken && status.taken_at && (
                  <span className="status-time">Taken at {formatTime(status.taken_at)}</span>
                )}
              </div>
            </div>

            <button
              className={`toggle-btn ${taken ? 'btn-undo' : 'btn-take'}`}
              onClick={handleToggle}
              disabled={toggling}
            >
              {toggling
                ? 'Updating...'
                : taken
                ? 'Undo — Mark as not taken'
                : 'Mark as Taken'}
            </button>
          </>
        )}
      </main>

      {history.length > 0 && (
        <section className="history">
          <h2>Last 7 days</h2>
          <ul>
            {history.map((row) => (
              <li key={row.date} className={`history-row ${row.taken ? 'taken' : 'missed'}`}>
                <span className="history-icon">{row.taken ? '✅' : '❌'}</span>
                <span className="history-date">{formatDate(row.date)}</span>
                {row.taken && row.taken_at && (
                  <span className="history-time">{formatTime(row.taken_at)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
