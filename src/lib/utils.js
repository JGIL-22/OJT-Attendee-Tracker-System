// ── lib/utils.js ─────────────────────────────────────────────────
// Pure utility functions — no external deps, no GAS references.

// ── OJT Config (from env or defaults) ───────────────────────────
export const TOTAL_HOURS   = Number(import.meta.env.VITE_OJT_TOTAL_HOURS  ?? 500);
export const HOURS_PER_DAY = Number(import.meta.env.VITE_OJT_HOURS_PER_DAY ?? 8);
export const OJT_START     = import.meta.env.VITE_OJT_START_DATE ?? '2026-03-03';
export const AUTO_LOGOUT_MS = 60 * 60 * 1000; // 1 hour idle

// ── ID Generator ─────────────────────────────────────────────────
export const genId = () => Math.random().toString(36).slice(2, 10);

// ── Philippine Time Helpers ──────────────────────────────────────
// Returns local date string "YYYY-MM-DD" (Philippines UTC+8)
export const toPhDate = (v) => {
  if (!v) return null;
  if (typeof v === 'string' && v.includes('T')) {
    const d = new Date(v);
    return new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 10);
  }
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (typeof v === 'number') {
    const d = new Date((v - 25569) * 86400000);
    return new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 10);
  }
  // Firestore Timestamp
  if (v?.toDate) return toPhDate(v.toDate().toISOString());
  return String(v).slice(0, 10);
};

export const todayStr = () => {
  const n = new Date();
  return new Date(n.getTime() + 8 * 3600000).toISOString().slice(0, 10);
};

// ── Format Helpers ───────────────────────────────────────────────
export const fmtDur = (ms) => {
  if (!ms || ms <= 0) return '0h 0m';
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = iso?.toDate ? iso.toDate() : new Date(iso);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const fmtTimeShort = (iso, h24 = false) => {
  if (!iso) return '—';
  const d = iso?.toDate ? iso.toDate() : new Date(iso);
  return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: !h24 });
};

// ── Calendar Helpers ─────────────────────────────────────────────
export const isWeekend = (s) => {
  const d = new Date(s);
  return d.getUTCDay() === 0 || d.getUTCDay() === 6;
};
export const isHoliday = (ev) => String(ev || '').toLowerCase().includes('holiday');
export const isWorkday = (ev, s) => !isWeekend(s) && !isHoliday(ev);

export const countWorkedDays = (rows) => {
  const t = todayStr();
  return rows.filter((r) => {
    const d  = toPhDate(r['Date']);
    const ev = r['Event/Notes'] || r['Event'] || r['Notes'] || '';
    return d && d <= t && isWorkday(ev, d);
  }).length;
};

// ── Greeting ─────────────────────────────────────────────────────
export const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: 'Good Morning',   emoji: '🌤️' };
  if (h >= 12 && h < 18) return { text: 'Good Afternoon', emoji: '🌇' };
  return                         { text: 'Good Evening',   emoji: '🌆' };
};

// ── Working Hours Engine ─────────────────────────────────────────
const BREAK_MS     = 3600000; // 1 hour lunch: 12–1pm
const LUNCH_START  = 12;
const LUNCH_END    = 13;

const isPilotDay = (d) => {
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  return y === 2026 && m === 2 && day >= 3 && day <= 6;
};

const officialStartMs = (d) => {
  const p = isPilotDay(d);
  const s = new Date(d);
  s.setHours(p ? 9 : 8, 0, 0, 0);
  return s.getTime();
};

export const isLateArrival = (actualIn) => {
  const d     = new Date(actualIn);
  const grace = isPilotDay(d) ? 0 : 10 * 60000;
  return d.getTime() - officialStartMs(d) > grace;
};

const officialEndH = (p) => (p ? 18 : 17);

const clampEnd = (d, p) => {
  const c = new Date(d);
  const officialEnd = new Date(c);
  officialEnd.setHours(officialEndH(p), 0, 0, 0);
  return c < officialEnd ? officialEnd : c;
};

export const calcEffDur = (i, o) => {
  const rI = new Date(i), rO = new Date(o), p = isPilotDay(rI);
  const raw = clampEnd(rO, p).getTime() - rI.getTime();
  return raw > 0 ? Math.max(raw - BREAK_MS, 0) : 0;
};

export const calcLiveDur = (i) => {
  const rI = new Date(i), now = new Date();
  const raw = now.getTime() - rI.getTime();
  return raw > 0 ? Math.max(raw - BREAK_MS, 0) : 0;
};

// ── Week number from OJT start ───────────────────────────────────
export const getOjtWeekNum = () => {
  const ojtStart = new Date(OJT_START + 'T00:00:00');
  const dow      = ojtStart.getDay();
  const startMon = new Date(ojtStart.getTime() - (dow === 0 ? 6 : dow - 1) * 86400000);
  const diff     = Math.floor((new Date() - startMon) / 86400000);
  return Math.max(1, Math.floor(diff / 7) + 1);
};
