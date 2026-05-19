// ── components/LogsTab.jsx ────────────────────────────────────────
import { fmtDate, fmtTimeShort } from '../lib/utils.js';

export default function LogsTab({ loginLogs, h24 }) {
  const sorted = [...loginLogs].sort((a, b) => {
    const ta = a.createdAt?.toDate?.() ?? new Date(a.ts ?? 0);
    const tb = b.createdAt?.toDate?.() ?? new Date(b.ts ?? 0);
    return tb - ta;
  });

  return (
    <div style={{ padding: '16px', animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>Login Logs</div>
        <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2 }}>Powered by Firestore · {sorted.length} event{sorted.length !== 1 ? 's' : ''}</div>
      </div>

      {sorted.length === 0 ? (
        <div className="glass" style={{ padding: '56px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🔐</div>
          <div style={{ color: 'var(--text2)', fontSize: 14 }}>No login activity yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((l, i) => {
            const ts = l.createdAt?.toDate?.() ?? new Date(l.ts);
            const isLogin = l.event === 'LOGIN';
            return (
              <div key={l.id || i} className="glass" style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, animation: `fadeUp 0.3s ease ${i * 0.03}s both` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, background: isLogin ? 'rgba(42,157,143,0.1)' : 'rgba(224,85,85,0.08)', border: `1px solid ${isLogin ? 'rgba(42,157,143,0.25)' : 'rgba(224,85,85,0.2)'}` }}>
                  {isLogin ? '🔓' : '🔒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span className="chip" style={{ background: isLogin ? 'rgba(42,157,143,0.1)' : 'rgba(224,85,85,0.08)', color: isLogin ? 'var(--teal)' : 'var(--red)', border: `1px solid ${isLogin ? 'rgba(42,157,143,0.25)' : 'rgba(224,85,85,0.2)'}` }}>
                      {l.event}
                    </span>
                    <span style={{ color: 'var(--text2)', fontSize: 12 }}>{l.firstName || l.username || '—'}</span>
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 4, fontFamily: 'var(--mono)' }}>
                    {fmtDate(ts)} · {fmtTimeShort(ts, h24)}
                  </div>
                  {l.username && (
                    <div style={{ color: 'var(--text3)', fontSize: 10, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.username}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
