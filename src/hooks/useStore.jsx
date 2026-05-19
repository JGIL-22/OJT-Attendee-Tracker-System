// ── hooks/useStore.jsx ───────────────────────────────────────────
import {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { useAuth } from './useAuth.jsx';
import {
  addSession, updateSession, deleteSession, subscribeToSessions,
  addAbsent, deleteAbsent, subscribeToAbsents,
  subscribeToLoginLogs,
  getSchedule,
  saveSettings, loadSettings,
} from '../lib/firebase.js';
import {
  calcEffDur, toPhDate, todayStr, countWorkedDays,
  TOTAL_HOURS, HOURS_PER_DAY, AUTO_LOGOUT_MS, genId,
} from '../lib/utils.js';

const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const LAST_ACTIVE_KEY = 'ojt_last_active';

export function useStore() {
  const { firebaseUser, userProfile, isOwner } = useAuth();
  const uid = firebaseUser?.uid;

  const [theme,        setThemeRaw]        = useState(() => LS.get('ojt_theme', 'dark'));
  const [h24,          setH24Raw]          = useState(() => LS.get('ojt_h24', false));
  const [calView,      setCalViewRaw]      = useState(() => LS.get('ojt_calview', 'paged'));
  const [reqHours,     setReqHoursRaw]     = useState(() => LS.get('ojt_reqhours', 500));
  const [workWeekends, setWorkWeekendsRaw] = useState(() => LS.get('ojt_wknd', false));
  const [nickname,     setNicknameRaw]     = useState(() => LS.get('ojt_nickname', ''));
  const [yearLevel,    setYearLevelRaw]    = useState(() => LS.get('ojt_yearlevel', ''));

  const setTheme        = (t) => { setThemeRaw(t);        LS.set('ojt_theme', t);      document.body.className = 'theme-' + t; };
  const setH24          = (v) => { setH24Raw(v);          LS.set('ojt_h24', v); };
  const setCalView      = (v) => { setCalViewRaw(v);      LS.set('ojt_calview', v); };
  const setReqHours     = (v) => { setReqHoursRaw(v);     LS.set('ojt_reqhours', v); };
  const setWorkWeekends = (v) => { setWorkWeekendsRaw(v); LS.set('ojt_wknd', v); };
  const setNickname     = (v) => { setNicknameRaw(v);     LS.set('ojt_nickname', v); };
  const setYearLevel    = (v) => { setYearLevelRaw(v);    LS.set('ojt_yearlevel', v); };

  useEffect(() => { document.body.className = 'theme-' + theme; }, []);

  const [sessions,      setSessions]      = useState([]);
  const [absents,       setAbsents]       = useState([]);
  const [loginLogs,     setLoginLogs]     = useState([]);
  const [schedule,      setScheduleState] = useState([]);
  const [active,        setActive]        = useState(null);

  useEffect(() => {
    if (!uid) return;
    const unsubSessions = subscribeToSessions(uid, (rows) => {
      const processed = rows.map((r) => ({
        ...r,
        duration: r.actualTimeIn && r.actualTimeOut
          ? calcEffDur(r.actualTimeIn?.toDate?.() ?? r.actualTimeIn, r.actualTimeOut?.toDate?.() ?? r.actualTimeOut)
          : (r.duration || 0),
      }));
      const activeRow = processed.find((s) => s.timeIn && !s.timeOut);
      setActive(activeRow ?? null);
      setSessions(processed.filter((s) => s.timeOut));
    });
    const unsubAbsents = subscribeToAbsents(uid, setAbsents);
    const unsubLogs    = subscribeToLoginLogs(uid, setLoginLogs);
    return () => { unsubSessions(); unsubAbsents(); unsubLogs(); };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    getSchedule().then(setScheduleState).catch(console.error);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    loadSettings(uid).then((s) => {
      if (!s) return;
      if (s.theme)               setTheme(s.theme);
      if (s.h24 != null)         setH24Raw(s.h24);
      if (s.calView)             setCalViewRaw(s.calView);
      if (s.reqHours)            setReqHoursRaw(s.reqHours);
      if (s.workWeekends != null) setWorkWeekendsRaw(s.workWeekends);
      if (s.nickname  != null)   { setNicknameRaw(s.nickname);  LS.set('ojt_nickname', s.nickname); }
      if (s.yearLevel != null)   { setYearLevelRaw(s.yearLevel); LS.set('ojt_yearlevel', s.yearLevel); }
    }).catch(console.error);
  }, [uid]);

  const settingsRef = useRef({ theme, h24, calView, reqHours, workWeekends, nickname, yearLevel });
  useEffect(() => {
    const prev = settingsRef.current;
    const changed =
      prev.theme !== theme || prev.h24 !== h24 || prev.calView !== calView ||
      prev.reqHours !== reqHours || prev.workWeekends !== workWeekends ||
      prev.nickname !== nickname || prev.yearLevel !== yearLevel;
    if (changed && uid) {
      settingsRef.current = { theme, h24, calView, reqHours, workWeekends, nickname, yearLevel };
      saveSettings(uid, { theme, h24, calView, reqHours, workWeekends, nickname, yearLevel }).catch(console.error);
    }
  }, [theme, h24, calView, reqHours, workWeekends, nickname, yearLevel, uid]);

  const resetActivity = useCallback(() => { LS.set(LAST_ACTIVE_KEY, Date.now()); }, []);
  useEffect(() => {
    if (!uid) return;
    resetActivity();
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    EVENTS.forEach((e) => window.addEventListener(e, resetActivity, { passive: true }));
    const iv = setInterval(() => {
      const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0');
      if (Date.now() - last >= AUTO_LOGOUT_MS) {
        localStorage.removeItem(LAST_ACTIVE_KEY);
        import('../lib/firebase.js').then(({ signOutUser }) => signOutUser());
      }
    }, 30000);
    return () => { EVENTS.forEach((e) => window.removeEventListener(e, resetActivity)); clearInterval(iv); };
  }, [uid, resetActivity]);

  const doTimeIn = useCallback(async (note = '') => {
    if (!uid) return;
    const now   = new Date().toISOString();
    const entry = { id: genId(), actualTimeIn: now, timeIn: now, timeOut: null, actualTimeOut: null, duration: 0, note };
    setActive(entry);
    await addSession(uid, entry);
  }, [uid]);

  const doTimeOut = useCallback(async () => {
    if (!uid || !active) return;
    const now = new Date().toISOString();
    const dur = calcEffDur(active.actualTimeIn, now);
    setActive(null);
    await updateSession(uid, active.id, { timeOut: now, actualTimeOut: now, duration: dur });
  }, [uid, active]);

  const logManualSession = useCallback(async ({ date, hours, remarks, timeIn, timeOut }) => {
    if (!uid) return;
    const tiISO = timeIn  ? `${date}T${timeIn}:00`  : `${date}T08:00:00`;
    const toISO = timeOut ? `${date}T${timeOut}:00` : `${date}T17:00:00`;
    await addSession(uid, { id: genId(), actualTimeIn: tiISO, timeIn: tiISO, actualTimeOut: toISO, timeOut: toISO, duration: hours * 3600000, note: remarks });
  }, [uid]);

  const delSession = useCallback(async (id) => { if (uid) await deleteSession(uid, id); }, [uid]);
  const markAbsent = useCallback(async ({ date, reason, type = 'absent' }) => {
    if (uid) await addAbsent(uid, { id: genId(), date, type, reason, loggedAt: new Date().toISOString() });
  }, [uid]);
  const delAbsent = useCallback(async (id) => { if (uid) await deleteAbsent(uid, id); }, [uid]);

  const totalHours    = sessions.reduce((a, s) => a + (s.duration || 0), 0) / 3600000;
  const expectedHours = useMemo(() => countWorkedDays(schedule) * HOURS_PER_DAY, [schedule]);
  const progress      = Math.min((totalHours / (reqHours || TOTAL_HOURS)) * 100, 100);

  return {
    uid, userProfile, isOwner,
    sessions, active, absents, loginLogs, schedule, setScheduleState,
    totalHours, expectedHours, progress,
    theme, setTheme, h24, setH24, calView, setCalView,
    reqHours, setReqHours, workWeekends, setWorkWeekends,
    nickname, setNickname, yearLevel, setYearLevel,
    doTimeIn, doTimeOut, logManualSession, delSession, markAbsent, delAbsent,
  };
}
