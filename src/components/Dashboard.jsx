// ── components/Dashboard.jsx ──────────────────────────────────────
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useStore } from '../hooks/useStore.jsx';
import DashTab from './DashTab.jsx';
import SessionsTab from './SessionsTab.jsx';
import CalendarTab from './CalendarTab.jsx';
import ScheduleTab from './ScheduleTab.jsx';
import LogsTab from './LogsTab.jsx';
import SettingsTab from './SettingsTab.jsx';
import AbsentModal from './AbsentModal.jsx';
import LogHoursModal from './LogHoursModal.jsx';

const TABS = [
  { id: 'home',     label: 'Home',     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'sessions', label: 'Sessions', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: 'calendar', label: 'Calendar', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
  { id: 'schedule', label: 'Schedule', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
  { id: 'logs',     label: 'Logs',     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id: 'settings', label: 'Settings', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function Dashboard() {
  const { userProfile } = useAuth();
  const store = useStore();
  const {
    active, sessions, absents,
    delSession, delAbsent, doTimeIn, doTimeOut,
    markAbsent, logManualSession,
    h24, schedule, loginLogs, reqHours,
  } = store;

  const [tab,              setTab]              = useState('home');
  const [showAbsentModal,  setShowAbsentModal]  = useState(false);
  const [showLeaveModal,   setShowLeaveModal]   = useState(false);
  const [showLogHoursModal,setShowLogHoursModal]= useState(false);
  const [logHoursData,     setLogHoursData]     = useState(null);

  // Live session timer
  const [liveMs, setLiveMs] = useState(0);
  useEffect(() => {
    let iv;
    if (active) {
      const tick = () => {
        const start = active.actualTimeIn?.toDate?.() ?? new Date(active.actualTimeIn);
        setLiveMs(Date.now() - start.getTime());
      };
      tick();
      iv = setInterval(tick, 1000);
    } else {
      setLiveMs(0);
    }
    return () => clearInterval(iv);
  }, [active]);

  const liveHours = liveMs / 3600000;
  const livePct   = Math.min((liveHours / (reqHours || 500)) * 100, 100);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showLogHoursModal && (
        <LogHoursModal
          initDate={logHoursData?.initDate}
          initSess={logHoursData?.initSess}
          onClose={() => { setShowLogHoursModal(false); setLogHoursData(null); }}
          onSave={async (data) => { await logManualSession(data); setShowLogHoursModal(false); setLogHoursData(null); }}
        />
      )}
      {showAbsentModal && (
        <AbsentModal
          onConfirm={async ({ date, reason }) => { await markAbsent({ date, reason, type: 'absent' }); setShowAbsentModal(false); }}
          onClose={() => setShowAbsentModal(false)}
        />
      )}
      {showLeaveModal && (
        <AbsentModal type="leave"
          onConfirm={async ({ date, reason }) => { await markAbsent({ date, reason, type: 'leave' }); setShowLeaveModal(false); }}
          onClose={() => setShowLeaveModal(false)}
        />
      )}

      {/* ── Left Sidebar ────────────────────────────────────────── */}
      <nav className="left-nav">
        {/* Logo */}
        <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,var(--teal),var(--sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0, boxShadow: '0 4px 14px rgba(42,157,143,0.35)' }}>
          <svg width="24" height="24" viewBox="0 0 38 38" fill="none">
            <rect x="6" y="7" width="26" height="28" rx="3" stroke="white" strokeWidth="2" strokeOpacity="0.9"/>
            <circle cx="19" cy="17" r="3" fill="white" opacity="0.9"/>
            <path d="M12 27c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
          </svg>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', alignItems: 'center', flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} className={`nav-btn tap ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* User avatar at bottom */}
        {userProfile && (
          <button className="tap nav-btn" onClick={() => setTab('settings')}
            style={{ marginTop: 8, width: 76, height: 58, borderRadius: 16, background: tab === 'settings' ? 'rgba(42,157,143,0.13)' : 'none', border: 'none', cursor: 'pointer' }}>
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="avatar" width={32} height={32} style={{ borderRadius: '50%', border: '2px solid var(--teal)' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', fontWeight: 700 }}>
                {(userProfile.displayName || userProfile.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="nav-label" style={{ color: 'var(--text3)', fontSize: 8.5 }}>Profile</span>
          </button>
        )}
      </nav>

      {/* ── Mobile bottom nav ────────────────────────────────────── */}
      <div className="mobile-bottom-nav">
        {TABS.map(t => (
          <button key={t.id} className={`mob-nav-btn tap ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="mob-nav-icon">{t.icon}</span>
            <span className="mob-nav-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="main-wrap" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingLeft: 96 }}>
        {tab === 'home' ? (
          <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 32 }}>
            <DashTab
              store={store}
              doTimeIn={doTimeIn}
              doTimeOut={doTimeOut}
              liveMs={liveMs}
              liveHours={liveHours}
              livePct={livePct}
              sessions={sessions}
              onMarkAbsent={() => setShowAbsentModal(true)}
              onMarkLeave={() => setShowLeaveModal(true)}
              onLogHours={(initDate, initSess) => { setLogHoursData({ initDate, initSess }); setShowLogHoursModal(true); }}
            />
          </div>
        ) : (
          <div style={{ maxWidth: 540, margin: '0 auto', paddingBottom: 32 }}>
            {tab === 'sessions' && <SessionsTab sessions={sessions} absents={absents} delSession={delSession} delAbsent={delAbsent} h24={h24} />}
            {tab === 'calendar' && <CalendarTab sessions={sessions} schedule={schedule} />}
            {tab === 'schedule' && <ScheduleTab schedule={schedule} sessions={sessions} absents={absents} />}
            {tab === 'logs'     && <LogsTab loginLogs={loginLogs} h24={h24} />}
            {tab === 'settings' && <SettingsTab store={store} />}
          </div>
        )}
      </div>
    </div>
  );
}
