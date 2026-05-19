// ── components/ConfirmModal.jsx ───────────────────────────────────
export function ConfirmModal({ icon, title, message, detail, confirmLabel, confirmColor, onConfirm, onClose }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass" style={{ width:'100%',maxWidth:340,padding:'26px 22px 20px',animation:'cardIn 0.25s cubic-bezier(.22,1,.36,1) both',textAlign:'center' }}>
        <div style={{ width:56,height:56,borderRadius:18,background:`rgba(${confirmColor==='red'?'224,85,85':'233,168,51'},0.12)`,border:`1.5px solid rgba(${confirmColor==='red'?'224,85,85':'233,168,51'},0.28)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
          {icon}
        </div>
        <div style={{ fontSize:17,fontWeight:800,color:'var(--text)',marginBottom:8 }}>{title}</div>
        <div style={{ color:'var(--text2)',fontSize:13,lineHeight:1.5,marginBottom:6 }}>{message}</div>
        {detail && <div style={{ color:'var(--text3)',fontSize:11,fontFamily:'var(--mono)',marginBottom:16,padding:'7px 12px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--s-border)' }}>{detail}</div>}
        <div style={{ display:'flex',gap:9,marginTop:16 }}>
          <button className="tap" onClick={onClose} style={{ flex:1,padding:'13px',borderRadius:12,border:'1px solid var(--s-border)',background:'var(--surface2)',color:'var(--text2)',fontSize:14,fontWeight:600,cursor:'pointer' }}>Cancel</button>
          <button className="tap" onClick={onConfirm} style={{ flex:1,padding:'13px',borderRadius:12,border:'none',background:confirmColor==='red'?'linear-gradient(135deg,var(--coral),var(--red))':'linear-gradient(135deg,var(--amber),var(--orange))',color:'white',fontSize:14,fontWeight:700,cursor:'pointer' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ConfirmModal;
