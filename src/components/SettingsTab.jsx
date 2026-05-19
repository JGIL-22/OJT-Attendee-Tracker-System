// ── components/SettingsTab.jsx ────────────────────────────────────
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const YEAR_LEVELS = [
  'SHS',
  '1st Year College',
  '2nd Year College',
  '3rd Year College',
  '4th Year College',
  '5th Year College',
];

export default function SettingsTab({ store }) {
  const { userProfile, logout } = useAuth();
  const {
    theme, setTheme,
    h24, setH24,
    reqHours, setReqHours,
    workWeekends, setWorkWeekends,
    nickname, setNickname,
    yearLevel, setYearLevel,
  } = store;

  const [nickInput,   setNickInput]   = useState(nickname || '');
  const [reqInput,    setReqInput]    = useState(String(reqHours));
  const [yearInput,   setYearInput]   = useState(yearLevel || '');
  const [saved,       setSaved]       = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const handleSave = () => {
    const v = parseInt(reqInput);
    if (!isNaN(v) && v > 0) setReqHours(v);
    if (nickInput.trim()) setNickname(nickInput.trim());
    if (yearInput) setYearLevel(yearInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Row = ({ label, sub, children }) => (
    <div className="settings-row">
      <div style={{ flex: 1 }}>
        <div className="settings-label">{label}</div>
        {sub && <div className="settings-sub">{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '16px', animation: 'fadeUp 0.35s ease both' }}>

      {/* Sign-out confirm overlay */}
      {showSignOut && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowSignOut(false); }}>
          <div className="glass" style={{ width:'100%',maxWidth:320,padding:'28px 22px 22px',animation:'cardIn 0.25s cubic-bezier(.22,1,.36,1) both',textAlign:'center' }}>
            <div style={{ fontSize:38,marginBottom:10 }}>👋</div>
            <div style={{ fontSize:17,fontWeight:800,color:'var(--text)',marginBottom:8 }}>Sign Out?</div>
            <div style={{ color:'var(--text2)',fontSize:13,marginBottom:20,lineHeight:1.5 }}>
              You'll be signed out of OJT Tracker. Your data is safely stored in Firestore.
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button className="tap" onClick={() => setShowSignOut(false)}
                style={{ flex:1,padding:'13px',borderRadius:12,border:'1px solid var(--s-border)',background:'var(--surface2)',color:'var(--text2)',fontSize:14,fontWeight:600,cursor:'pointer' }}>
                Cancel
              </button>
              <button className="tap" onClick={() => { setShowSignOut(false); logout(); }}
                style={{ flex:1,padding:'13px',borderRadius:12,border:'none',background:'linear-gradient(135deg,var(--coral),var(--red))',color:'white',fontSize:14,fontWeight:700,cursor:'pointer' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>Settings</div>
      <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 18 }}>Preferences sync across all devices via Firestore.</div>

      {/* ── Profile Card ─────────────────────────────────────────── */}
      {userProfile && (
        <div className="glass" style={{ padding: '18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          {userProfile.photoURL ? (
            <img src={userProfile.photoURL} alt="avatar" width={52} height={52}
              style={{ borderRadius: '50%', border: '2.5px solid var(--teal)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {(userProfile.displayName || userProfile.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nickname || userProfile.displayName || 'Unknown'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <span className="chip" style={{ background: userProfile.role === 'owner' ? 'rgba(42,157,143,0.1)' : 'rgba(91,188,214,0.08)', color: userProfile.role === 'owner' ? 'var(--teal)' : 'var(--sky)', border: `1px solid ${userProfile.role === 'owner' ? 'rgba(42,157,143,0.3)' : 'rgba(91,188,214,0.2)'}` }}>
                {userProfile.role === 'owner' ? '👑 Owner' : '👤 User'}
              </span>
              {yearLevel && (
                <span className="chip" style={{ background: 'rgba(233,168,51,0.08)', color: 'var(--amber)', border: '1px solid rgba(233,168,51,0.2)' }}>
                  🎓 {yearLevel}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Personal Info ─────────────────────────────────────────── */}
      <div className="glass" style={{ padding: '4px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', padding: '12px 0 6px' }}>Personal Info</div>

        <Row label="Display Name" sub="Used in greetings (Good Morning, ...)">
          <input
            type="text"
            value={nickInput}
            onChange={e => setNickInput(e.target.value)}
            placeholder={userProfile?.displayName?.split(' ')[0] || 'Nickname'}
            style={{ width: 130, background: 'var(--surface2)', border: '1.5px solid var(--s-border)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'Figtree,sans-serif', textAlign: 'right' }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--s-border)'}
          />
        </Row>

        <Row label="Year Level" sub="Your current academic level">
          <select
            value={yearInput}
            onChange={e => setYearInput(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1.5px solid var(--s-border)', borderRadius: 8, padding: '8px 10px', color: yearInput ? 'var(--text)' : 'var(--text3)', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Figtree,sans-serif', minWidth: 130 }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--s-border)'}
          >
            <option value="" disabled>Select level</option>
            {YEAR_LEVELS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Row>
      </div>

      {/* ── Appearance ───────────────────────────────────────────── */}
      <div className="glass" style={{ padding: '4px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', padding: '12px 0 6px' }}>Appearance</div>

        <Row label="Theme" sub="Switch between dark and light mode">
          <div className="pill-toggle">
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>🌙 Dark</button>
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>☀️ Light</button>
          </div>
        </Row>

        <Row label="Time Format" sub="12-hour or 24-hour clock display">
          <div className="pill-toggle">
            <button className={!h24 ? 'on' : ''} onClick={() => setH24(false)}>12h</button>
            <button className={h24 ? 'on' : ''} onClick={() => setH24(true)}>24h</button>
          </div>
        </Row>
      </div>

      {/* ── OJT Config ───────────────────────────────────────────── */}
      <div className="glass" style={{ padding: '4px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', padding: '12px 0 6px' }}>OJT Configuration</div>

        <Row label="Required Hours" sub="Total internship hours required">
          <input
            type="number" min="1" max="9999" value={reqInput}
            onChange={e => setReqInput(e.target.value)}
            style={{ width: 80, background: 'var(--surface2)', border: '1.5px solid var(--s-border)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 14, outline: 'none', textAlign: 'center', fontFamily: 'var(--mono)' }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--s-border)'}
          />
        </Row>

        <Row label="Count Weekends" sub="Include Saturday / Sunday in schedule">
          <button className="tap"
            onClick={() => setWorkWeekends(!workWeekends)}
            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: workWeekends ? 'var(--teal)' : 'var(--surface2)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 2, left: workWeekends ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
        </Row>

        <div style={{ padding: '14px 0 10px' }}>
          <button className="settings-save-btn tap" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ── Account ──────────────────────────────────────────────── */}
      <div className="glass" style={{ padding: '4px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', padding: '12px 0 6px' }}>Account</div>
        <div style={{ padding: '10px 0 14px' }}>
          <button className="tap"
            onClick={() => setShowSignOut(true)}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid rgba(224,85,85,0.3)', background: 'rgba(224,85,85,0.06)', color: 'var(--red)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Figtree,sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,85,85,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(224,85,85,0.06)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── About ────────────────────────────────────────────────── */}
      <div className="glass" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>About</div>
        {[
          ['Backend',        'Firebase Firestore + Auth'],
          ['Deployment',     'Vercel'],
          ['Auth Method',    'Google OAuth 2.0'],
          ['Offline Support','IndexedDB (Firestore)'],
          ['Auto-logout',    '1 hour idle'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--s-border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text2)' }}>{k}</span>
            <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
