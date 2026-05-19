// ── components/SessionsTab.jsx ────────────────────────────────────
import { useState } from 'react';
import { fmtDur, fmtDate, fmtTimeShort, toPhDate } from '../lib/utils.js';

export default function SessionsTab({ sessions, absents, delSession, delAbsent, h24 }) {
  const [delConfirm, setDelConfirm] = useState(null); // {type:'session'|'absent', id}

  const handleDel = async () => {
    if (!delConfirm) return;
    if (delConfirm.type === 'session') await delSession(delConfirm.id);
    else await delAbsent(delConfirm.id);
    setDelConfirm(null);
  };

  const sorted = [...sessions].sort((a, b) => {
    const da = new Date(a.actualTimeIn?.toDate?.() ?? a.actualTimeIn ?? 0);
    const db_ = new Date(b.actualTimeIn?.toDate?.() ?? b.actualTimeIn ?? 0);
    return db_ - da;
  });

  const sortedAbsents = [...absents].sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div style={{ padding: '16px', animation: 'fadeUp 0.35s ease both' }}>
      {/* Delete confirm */}
      {delConfirm && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(6px)' }}>
          <div className="glass" style={{ width:'100%',maxWidth:320,padding:'24px 20px',animation:'cardIn 0.2s ease both',textAlign:'center' }}>
            <div style={{ fontSize:36,marginBottom:10 }}>🗑️</div>
            <div style={{ fontSize:16,fontWeight:800,color:'var(--text)',marginBottom:8 }}>Delete record?</div>
            <div style={{ color:'var(--text2)',fontSize:13,marginBottom:18 }}>This action cannot be undone.</div>
            <div style={{ display:'flex',gap:9 }}>
              <button className="tap" onClick={() => setDelConfirm(null)} style={{ flex:1,padding:'12px',borderRadius:11,border:'1px solid var(--s-border)',background:'var(--surface2)',color:'var(--text2)',fontSize:13,fontWeight:600,cursor:'pointer' }}>Cancel</button>
              <button className="tap" onClick={handleDel} style={{ flex:1,padding:'12px',borderRadius:11,border:'none',background:'linear-gradient(135deg,var(--coral),var(--red))',color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>Sessions</div>
        <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2 }}>{sessions.length} recorded session{sessions.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Sessions list */}
      {sorted.length === 0 ? (
        <div className="glass" style={{ padding: '56px 20px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🕐</div>
          <div style={{ color: 'var(--text2)', fontSize: 14 }}>No sessions recorded yet.</div>
          <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Use Time In/Out on the Home tab to start logging.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {sorted.map((s, i) => {
            const tiRaw = s.actualTimeIn?.toDate?.() ?? s.actualTimeIn;
            const toRaw = s.actualTimeOut?.toDate?.() ?? s.actualTimeOut;
            const date = toPhDate(tiRaw);
            const isFullDay = s.duration >= 8 * 3600000;
            return (
              <div key={s.id || i} className="glass" style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, animation: `fadeUp 0.3s ease ${i * 0.025}s both` }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: isFullDay ? 'rgba(76,175,130,0.1)' : 'rgba(233,168,51,0.1)', border: `1px solid ${isFullDay ? 'rgba(76,175,130,0.25)' : 'rgba(233,168,51,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {isFullDay ? '✅' : '⏱️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmtDate(tiRaw)}</span>
                    <span className="chip" style={{ background: isFullDay ? 'rgba(76,175,130,0.1)' : 'rgba(233,168,51,0.08)', color: isFullDay ? 'var(--green)' : 'var(--amber)', border: `1px solid ${isFullDay ? 'rgba(76,175,130,0.25)' : 'rgba(233,168,51,0.2)'}` }}>
                      {isFullDay ? '✓ Full' : 'Partial'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: 11, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>In: <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fmtTimeShort(tiRaw, h24)}</span></span>
                    <span>Out: <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fmtTimeShort(toRaw, h24)}</span></span>
                    <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{fmtDur(s.duration)}</span>
                  </div>
                  {s.note && <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 3, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.note}</div>}
                </div>
                <button className="tap" onClick={() => setDelConfirm({ type: 'session', id: s.id })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 6, borderRadius: 8, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Absents/Leaves */}
      {sortedAbsents.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Absences & Leaves</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedAbsents.map((a, i) => {
              const isLeave = a.type === 'leave';
              const color   = isLeave ? 'var(--sky)' : 'var(--red)';
              const rgb     = isLeave ? '91,188,214' : '224,85,85';
              return (
                <div key={a.id || i} className="glass" style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, animation: `fadeUp 0.3s ease ${i * 0.025}s both` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {isLeave ? '📋' : '❌'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmtDate(a.date + 'T12:00:00')}</span>
                      <span className="chip" style={{ background: `rgba(${rgb},0.1)`, color, border: `1px solid rgba(${rgb},0.25)` }}>{isLeave ? 'Leave' : 'Absent'}</span>
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: 11, marginTop: 3 }}>{a.reason}</div>
                  </div>
                  <button className="tap" onClick={() => setDelConfirm({ type: 'absent', id: a.id })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 6, borderRadius: 8, flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
