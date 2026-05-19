// ── components/DashTab.jsx ────────────────────────────────────────
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  fmtDur, fmtTimeShort, todayStr, toPhDate, isLateArrival, getGreeting,
  TOTAL_HOURS, OJT_START, getOjtWeekNum,
} from '../lib/utils.js';
import { useAuth } from '../hooks/useAuth.jsx';

// ── Progress Ring ─────────────────────────────────────────────────
function Ring({ pct, hours }) {
  const size = 126, r = 48, circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(91,188,214,0.3))' }}>
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a9d8f"/>
          <stop offset="50%" stopColor="#5bbcd6"/>
          <stop offset="100%" stopColor="#e9a833"/>
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#rg)" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}/>
      <text x={size/2} y={size/2-6} textAnchor="middle" fill="var(--sand)" fontSize="18" fontWeight="800" fontFamily="Figtree,sans-serif">{hours.toFixed(1)}</text>
      <text x={size/2} y={size/2+7} textAnchor="middle" fill="var(--text2)" fontSize="7.5" fontFamily="Figtree,sans-serif">of {TOTAL_HOURS} hrs</text>
      <text x={size/2} y={size/2+20} textAnchor="middle" fill="var(--sky)" fontSize="10" fontWeight="700" fontFamily="Rajdhani,sans-serif">{pct.toFixed(1)}%</text>
    </svg>
  );
}

// ── Analog Clock ──────────────────────────────────────────────────
function MilClock({ h24 }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const delay = 1000 - Date.now() % 1000;
    let iv;
    const t = setTimeout(() => { setNow(new Date()); iv = setInterval(() => setNow(new Date()), 1000); }, delay);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  const sec = now.getSeconds(), min = now.getMinutes() + sec / 60, hr = (now.getHours() % 12) + min / 60;
  const sDeg = sec * 6, mDeg = min * 6, hDeg = hr * 30;
  const S = 128, cx = 64, cy = 64, R = 56;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2, maj = i % 5 === 0;
    const inn = R - (maj ? 10 : 5), out = R - 1;
    return { x1: cx + inn * Math.cos(a), y1: cy + inn * Math.sin(a), x2: cx + out * Math.cos(a), y2: cy + out * Math.sin(a), maj };
  });
  const nums = [12,3,6,9].map(n => { const a = (((n/12)*360-90)) * Math.PI/180; return { n, x: cx+(R-20)*Math.cos(a), y: cy+(R-20)*Math.sin(a) }; });

  const dH = h24 ? String(now.getHours()).padStart(2,'0') : String(now.getHours()%12||12).padStart(2,'0');
  const dM = String(now.getMinutes()).padStart(2,'0');
  const dS = String(sec).padStart(2,'0');
  const ampm = h24 ? '' : (now.getHours() < 12 ? ' AM' : ' PM');

  return (
    <div className="glass" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ padding: '16px 14px 16px 18px', flexShrink: 0 }}>
          <svg width={S} height={S}>
            <circle cx={cx} cy={cy} r={R} fill="rgba(12,17,22,0.92)"/>
            {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.maj ? 'rgba(212,184,150,0.75)' : 'rgba(255,255,255,0.15)'} strokeWidth={t.maj ? 2 : 0.9} strokeLinecap="square"/>)}
            {nums.map(({ n, x, y }) => <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="rgba(212,184,150,0.7)" fontSize="8" fontFamily="Rajdhani,sans-serif" fontWeight="600">{String(n).padStart(2,'0')}</text>)}
            <line x1={cx} y1={cy} x2={cx+(R-22)*Math.cos((hDeg-90)*Math.PI/180)} y2={cy+(R-22)*Math.sin((hDeg-90)*Math.PI/180)} stroke="var(--beige)" strokeWidth="4" strokeLinecap="square"/>
            <line x1={cx} y1={cy} x2={cx+(R-9)*Math.cos((mDeg-90)*Math.PI/180)} y2={cy+(R-9)*Math.sin((mDeg-90)*Math.PI/180)} stroke="var(--sand)" strokeWidth="2.5" strokeLinecap="square"/>
            <line x1={cx} y1={cy} x2={cx+(R-5)*Math.cos((sDeg-90)*Math.PI/180)} y2={cy+(R-5)*Math.sin((sDeg-90)*Math.PI/180)} stroke="var(--sky)" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx={cx} cy={cy} r="4" fill="var(--sky)"/>
          </svg>
        </div>
        <div style={{ flex: 1, paddingRight: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 38, fontWeight: 700, color: 'var(--sand)', letterSpacing: '1px' }}>{dH}:{dM}</span>
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 38, fontWeight: 700, color: 'var(--sky)', marginLeft: 1 }}>:{dS}</span>
            {ampm && <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginLeft: 5, alignSelf: 'flex-end', paddingBottom: 4 }}>{ampm.trim()}</span>}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 10, marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{now.toLocaleDateString('en-PH', { weekday: 'long' })}</div>
          <div style={{ color: 'var(--text2)', fontSize: 11, marginTop: 2 }}>{now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 3 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ height: 2, flex: i < Math.floor(sec/6.1) ? 1 : 0.25, background: i < Math.floor(sec/6.1) ? 'var(--sky)' : 'rgba(255,255,255,0.07)', borderRadius: 1, transition: 'flex 0.18s' }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DashTab ───────────────────────────────────────────────────────
export default function DashTab({ store, doTimeIn, doTimeOut, liveMs, liveHours, livePct, sessions, onMarkAbsent, onMarkLeave, onLogHours }) {
  const { userProfile } = useAuth();
  const { totalHours, progress, h24, absents, active, schedule, reqHours } = store;

  const [note,       setNote]       = useState('');
  const [tiLoading,  setTiLoading]  = useState(false);
  const [toLoading,  setToLoading]  = useState(false);
  const [showTimeOutConfirm, setShowTimeOutConfirm] = useState(false);

  const g            = getGreeting();
  const displayName  = store.nickname || userProfile?.displayName?.split(' ')[0] || userProfile?.email?.split('@')[0] || 'Friend';
  const today        = todayStr();
  const weekNum      = getOjtWeekNum();

  const todayBlocked = absents.find(a => a.date === today);
  const todaySess    = sessions.find(s => toPhDate(s.actualTimeIn?.toDate?.() ?? s.actualTimeIn) === today);

  const liveTimeStr = (() => {
    if (!active) return null;
    const start = active.actualTimeIn?.toDate?.() ?? new Date(active.actualTimeIn);
    const elapsed = Math.floor(liveMs / 1000);
    const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  })();

  const handleTimeIn = async () => {
    if (tiLoading || active || todayBlocked) return;
    setTiLoading(true);
    await doTimeIn(note);
    setNote('');
    setTiLoading(false);
  };

  const handleTimeOut = async () => {
    setToLoading(true);
    await doTimeOut();
    setShowTimeOutConfirm(false);
    setToLoading(false);
  };

  // Recent 7 days bar chart
  const barData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 10);
      const sess = sessions.find(s => toPhDate(s.actualTimeIn?.toDate?.() ?? s.actualTimeIn) === dStr);
      return { label: d.toLocaleDateString('en-PH', { weekday: 'short' }).slice(0,2), hours: sess ? (sess.duration || 0) / 3600000 : 0, isToday: dStr === today };
    });
    return days;
  }, [sessions, today]);

  const maxBar = Math.max(...barData.map(d => d.hours), 8);

  return (
    <div style={{ padding: '16px 20px', animation: 'fadeUp 0.35s ease both' }}>

      {/* Time-out confirm overlay */}
      {showTimeOutConfirm && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowTimeOutConfirm(false); }}>
          <div className="glass" style={{ width:'100%',maxWidth:340,padding:'26px 22px 20px',animation:'cardIn 0.25s cubic-bezier(.22,1,.36,1) both',textAlign:'center' }}>
            <div style={{ fontSize:17,fontWeight:800,color:'var(--text)',marginBottom:8 }}>Confirm Time Out?</div>
            <div style={{ color:'var(--text2)',fontSize:13,marginBottom:8 }}>Are you sure you want to end your session for today?</div>
            {active && <div style={{ color:'var(--text3)',fontSize:11,fontFamily:'var(--mono)',marginBottom:18,padding:'7px 12px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--s-border)' }}>Started at {fmtTimeShort(active.actualTimeIn?.toDate?.() ?? active.actualTimeIn, h24)} · {liveTimeStr} elapsed</div>}
            <div style={{ display:'flex',gap:9,marginTop:16 }}>
              <button className="tap" onClick={() => setShowTimeOutConfirm(false)} style={{ flex:1,padding:'13px',borderRadius:12,border:'1px solid var(--s-border)',background:'var(--surface2)',color:'var(--text2)',fontSize:14,fontWeight:600,cursor:'pointer' }}>Cancel</button>
              <button className="tap" onClick={handleTimeOut} disabled={toLoading} style={{ flex:1,padding:'13px',borderRadius:12,border:'none',background:'linear-gradient(135deg,var(--coral),var(--red))',color:'white',fontSize:14,fontWeight:700,cursor:'pointer' }}>{toLoading ? 'Timing Out…' : 'Yes, Time Out'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          {g.emoji} {g.text}, <span style={{ color: 'var(--teal)' }}>{displayName}</span>!
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 3 }}>
          Week {weekNum} of your OJT · {today}
        </div>
      </div>

      {/* Clock */}
      <MilClock h24={h24}/>

      {/* Progress area */}
      <div className="glass" style={{ padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Ring pct={progress} hours={totalHours}/>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>OJT Progress</div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
              <div className="pbar-fill" style={{ width: `${progress}%` }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                [totalHours.toFixed(1)+'h', 'Logged', 'var(--teal)'],
                [(reqHours - totalHours).toFixed(1)+'h', 'Remaining', 'var(--amber)'],
                [progress.toFixed(1)+'%', 'Complete', 'var(--sky)'],
              ].map(([v, l, c]) => (
                <div key={l} style={{ background: 'var(--surface2)', borderRadius: 9, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--s-border)' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: 'Rajdhani,sans-serif' }}>{v}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active session ticker */}
      {active && (
        <div className="glass" style={{ padding: '14px 18px', marginBottom: 14, border: '1px solid rgba(42,157,143,0.3)', background: 'rgba(42,157,143,0.06)', animation: 'glow 2.5s ease infinite' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>● Session Active</div>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--sand)' }}>{liveTimeStr}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Started at {fmtTimeShort(active.actualTimeIn?.toDate?.() ?? active.actualTimeIn, h24)}</div>
            </div>
            <button className="tap" onClick={() => setShowTimeOutConfirm(true)}
              style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--coral),var(--red))', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(224,85,85,0.3)' }}>
              Time Out
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!active && (
        <div style={{ marginBottom: 14 }}>
          {todayBlocked ? (
            <div style={{ background: `rgba(${todayBlocked.type === 'leave' ? '91,188,214' : '224,85,85'},0.08)`, border: `1px solid rgba(${todayBlocked.type === 'leave' ? '91,188,214' : '224,85,85'},0.25)`, borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: todayBlocked.type === 'leave' ? 'var(--sky)' : 'var(--red)', marginBottom: 4 }}>
                {todayBlocked.type === 'leave' ? 'On Leave Today' : 'Marked Absent Today'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{todayBlocked.reason}</div>
            </div>
          ) : todaySess ? (
            <div style={{ background: 'rgba(76,175,130,0.08)', border: '1px solid rgba(76,175,130,0.25)', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>✓ Today's session complete</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDur(todaySess.duration)} logged</div>
            </div>
          ) : (
            <div>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note / task for today…"
                style={{ width: '100%', background: 'var(--surface2)', border: '1.5px solid var(--s-border)', borderRadius: 11, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 10, fontFamily: 'Figtree,sans-serif', transition: 'border-color 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }} onBlur={e => { e.target.style.borderColor = 'var(--s-border)'; }}/>
              <button className="tap" onClick={handleTimeIn} disabled={tiLoading}
                style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,var(--teal),var(--sky))', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 28px rgba(42,157,143,0.35)', transition: 'all 0.2s', letterSpacing: '0.02em' }}>
                {tiLoading ? 'Starting…' : '▶ Time In'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 14 }}>
        {[
          { label: 'Log Hours', icon: '📝', onClick: () => onLogHours(today, null), color: 'var(--sky)' },
          { label: 'Mark Absent', icon: '❌', onClick: onMarkAbsent, color: 'var(--red)' },
          { label: 'File Leave', icon: '📋', onClick: onMarkLeave, color: 'var(--amber)' },
        ].map(({ label, icon, onClick, color }) => (
          <button key={label} className="tap" onClick={onClick}
            style={{ padding: '13px 8px', borderRadius: 13, border: '1px solid var(--s-border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.18s' }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, color }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="glass" style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Last 7 Days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {barData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 8, color: d.hours > 0 ? 'var(--teal)' : 'var(--text3)', marginBottom: 3, fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {d.hours > 0 ? d.hours.toFixed(1) : ''}
              </div>
              <div className="bar-graph-bar" style={{ height: `${(d.hours / maxBar) * 100}%`, minHeight: 3, background: d.isToday ? 'linear-gradient(180deg,var(--teal),var(--sky))' : d.hours >= 8 ? 'rgba(76,175,130,0.6)' : d.hours > 0 ? 'rgba(233,168,51,0.5)' : 'rgba(255,255,255,0.05)' }}/>
              <div className="bar-graph-label" style={{ color: d.isToday ? 'var(--teal)' : 'var(--text3)' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
