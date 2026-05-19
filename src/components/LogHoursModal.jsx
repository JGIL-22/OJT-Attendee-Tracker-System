// ── components/LogHoursModal.jsx ──────────────────────────────────
import { useState } from 'react';
import { todayStr, fmtDur } from '../lib/utils.js';

export default function LogHoursModal({ initDate, initSess, onClose, onSave }) {
  const [date,     setDate]     = useState(initDate || todayStr());
  const [timeIn,   setTimeIn]   = useState(initSess ? initSess.timeIn?.slice(11,16) : '08:00');
  const [timeOut,  setTimeOut]  = useState(initSess ? initSess.timeOut?.slice(11,16) : '17:00');
  const [remarks,  setRemarks]  = useState(initSess?.note || '');
  const [saving,   setSaving]   = useState(false);

  const calcHours = () => {
    if (!timeIn || !timeOut) return 0;
    const [ih, im] = timeIn.split(':').map(Number);
    const [oh, om] = timeOut.split(':').map(Number);
    const total = (oh * 60 + om) - (ih * 60 + im) - 60; // minus 1h lunch
    return Math.max(total / 60, 0);
  };
  const hours = calcHours();

  const handleSave = async () => {
    if (hours <= 0) return;
    setSaving(true);
    await onSave({ date, hours, remarks, timeIn, timeOut });
    setSaving(false);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass" style={{ width:'100%',maxWidth:400,padding:'22px 20px',animation:'cardIn 0.28s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
          <div style={{ fontSize:16,fontWeight:800,color:'var(--text)' }}>
            {initSess ? 'Edit Session' : 'Log Hours'}
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ color:'var(--text2)',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',display:'block',marginBottom:6 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width:'100%',background:'var(--surface2)',border:'1.5px solid var(--s-border)',borderRadius:10,padding:'10px 12px',color:'var(--text)',fontSize:14,outline:'none',fontFamily:'var(--mono)' }}/>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14 }}>
          {[['Time In', timeIn, setTimeIn], ['Time Out', timeOut, setTimeOut]].map(([label, val, setter]) => (
            <div key={label}>
              <label style={{ color:'var(--text2)',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',display:'block',marginBottom:6 }}>{label}</label>
              <input type="time" value={val} onChange={e => setter(e.target.value)}
                style={{ width:'100%',background:'var(--surface2)',border:'1.5px solid var(--s-border)',borderRadius:10,padding:'10px 12px',color:'var(--text)',fontSize:14,outline:'none',fontFamily:'var(--mono)' }}/>
            </div>
          ))}
        </div>

        {hours > 0 && (
          <div style={{ background:'rgba(42,157,143,0.08)',border:'1px solid rgba(42,157,143,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:14,textAlign:'center' }}>
            <span style={{ color:'var(--teal)',fontWeight:800,fontSize:16 }}>{fmtDur(hours * 3600000)}</span>
            <span style={{ color:'var(--text2)',fontSize:12,marginLeft:8 }}>net (lunch deducted)</span>
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ color:'var(--text2)',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',display:'block',marginBottom:6 }}>Remarks / Tasks</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="What did you work on?" rows={3}
            style={{ width:'100%',background:'var(--surface2)',border:`1.5px solid ${remarks?'var(--teal)':'var(--s-border)'}`,borderRadius:10,padding:'11px 13px',color:'var(--text)',fontSize:13,outline:'none',resize:'vertical',fontFamily:'Figtree,sans-serif',transition:'border-color 0.2s' }}/>
        </div>

        <div style={{ display:'flex',gap:9 }}>
          <button className="tap" onClick={onClose} style={{ flex:1,padding:'13px',borderRadius:12,border:'1px solid var(--s-border)',background:'var(--surface2)',color:'var(--text2)',fontSize:13,fontWeight:600,cursor:'pointer' }}>Cancel</button>
          <button className="tap" onClick={handleSave} disabled={saving || hours <= 0}
            style={{ flex:2,padding:'14px',borderRadius:12,border:'none',background:hours>0?'linear-gradient(135deg,var(--teal),var(--sky))':'var(--surface2)',color:hours>0?'white':'var(--text3)',fontSize:14,fontWeight:700,cursor:hours>0?'pointer':'not-allowed',transition:'all 0.2s' }}>
            {saving ? 'Saving…' : initSess ? 'Save Changes' : 'Save Day'}
          </button>
        </div>
      </div>
    </div>
  );
}
