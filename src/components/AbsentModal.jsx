// ── components/AbsentModal.jsx ────────────────────────────────────
import { useState } from 'react';
import { todayStr } from '../lib/utils.js';

export default function AbsentModal({ onConfirm, onClose, type = 'absent' }) {
  const isLeave = type === 'leave';
  const [reason, setReason] = useState('');
  const [date,   setDate]   = useState(todayStr());
  const accentColor = isLeave ? 'var(--sky)' : 'var(--red)';
  const accentRgb   = isLeave ? '91,188,214' : '224,85,85';

  const PRESETS = isLeave
    ? ['Sick leave','Vacation leave','Emergency leave','Personal leave','Maternity/Paternity','Other']
    : ['Sick leave','Medical appointment','Family emergency','Personal matters','No available transport','Power/internet outage','Other'];

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass" style={{ width:'100%',maxWidth:380,padding:'22px 20px',animation:'cardIn 0.28s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:`rgba(${accentRgb},0.1)`,border:`1px solid rgba(${accentRgb},0.25)`,display:'flex',alignItems:'center',justifyContent:'center' }}>
              {isLeave
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
            </div>
            <div style={{ fontSize:15,fontWeight:800,color:'var(--text)' }}>{isLeave ? 'File Leave' : 'Mark Absent'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Date */}
        <div style={{ marginBottom:14 }}>
          <label style={{ color:'var(--text2)',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',display:'block',marginBottom:6 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width:'100%',background:'var(--surface2)',border:'1.5px solid var(--s-border)',borderRadius:10,padding:'10px 12px',color:'var(--text)',fontSize:14,outline:'none',fontFamily:'var(--mono)' }}/>
        </div>

        {/* Reason presets */}
        <div style={{ marginBottom:12 }}>
          <label style={{ color:'var(--text2)',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',display:'block',marginBottom:8 }}>Reason</label>
          <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:10 }}>
            {PRESETS.map(p => (
              <button key={p} className="tap" onClick={() => setReason(p)}
                style={{ padding:'5px 10px',borderRadius:16,border:`1px solid ${reason===p?`rgba(${accentRgb},0.4)`:'var(--s-border)'}`,background:reason===p?`rgba(${accentRgb},0.1)`:'var(--surface2)',color:reason===p?accentColor:'var(--text2)',fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Or type a custom reason…" rows={2}
            style={{ width:'100%',background:'var(--surface2)',border:`1.5px solid ${reason?`rgba(${accentRgb},0.35)`:'var(--s-border)'}`,borderRadius:10,padding:'10px 12px',color:'var(--text)',fontSize:13,outline:'none',resize:'none',fontFamily:'var(--Figtree,sans-serif)' }}/>
        </div>

        <div style={{ display:'flex',gap:9 }}>
          <button className="tap" onClick={onClose} style={{ flex:1,padding:'13px',borderRadius:12,border:'1px solid var(--s-border)',background:'var(--surface2)',color:'var(--text2)',fontSize:13,fontWeight:600,cursor:'pointer' }}>Cancel</button>
          <button className="tap" onClick={() => { if (reason.trim()) onConfirm({ date, reason: reason.trim() }); }} disabled={!reason.trim()}
            style={{ flex:2,padding:'13px',borderRadius:12,border:'none',background:reason.trim()?`linear-gradient(135deg,rgba(${accentRgb},0.9),rgba(${accentRgb},0.7))`:'var(--surface2)',color:reason.trim()?'white':'var(--text3)',fontSize:14,fontWeight:700,cursor:reason.trim()?'pointer':'not-allowed',transition:'all 0.2s' }}>
            {isLeave ? 'File Leave' : 'Mark Absent'}
          </button>
        </div>
      </div>
    </div>
  );
}
