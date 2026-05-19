// ── pages/Login.jsx ───────────────────────────────────────────────
// Firebase Google Sign-In — replaces the manual username/password form.
// No SCRIPT_URL. No simpleHash. No UserAccounts sheet lookup.

import { useAuth } from '../hooks/useAuth.jsx';
import { getGreeting } from '../lib/utils.js';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const { login, authLoading, authError } = useAuth();
  const g = getGreeting();

  return (
    <div
      style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '28px 20px', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Magic Rings background */}
      <div className="magic-rings-wrap">
        <div className="magic-rings-scene">
          <div className="magic-ring mr1" />
          <div className="magic-ring mr2" />
          <div className="magic-ring mr3" />
        </div>
      </div>
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'radial-gradient(ellipse at center, transparent 20%, var(--bg) 75%)',
        }}
      />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 2, animation: 'cardIn 0.5s cubic-bezier(.22,1,.36,1) both' }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg,var(--teal),var(--sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 10px 32px rgba(42,157,143,0.35)' }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <rect x="6" y="7" width="26" height="28" rx="3" fill="white" opacity="0.15"/>
              <rect x="6" y="7" width="26" height="28" rx="3" stroke="white" strokeWidth="2" strokeOpacity="0.9"/>
              <rect x="14" y="4" width="10" height="6" rx="2" fill="white" opacity="0.9"/>
              <circle cx="19" cy="17" r="3" fill="white" opacity="0.9"/>
              <path d="M12 27c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
            </svg>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            OJT <span style={{ color: 'var(--teal)' }}>Tracker</span>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Internship Attendance Portal · ATS</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20, color: 'var(--sand)', fontSize: 15, fontWeight: 600 }}>
          {g.emoji} {g.text}!
        </div>

        {/* Sign-In Card */}
        <div className="glass" style={{ padding: '28px 22px 24px' }}>

          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Sign in to continue
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              Use your <strong>Gmail account</strong> to sign in securely.<br />
              Your data is private and encrypted via Firebase.
            </div>
          </div>

          {/* Error */}
          {authError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.22)', borderRadius: 9, padding: '9px 12px', marginBottom: 16 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: 'var(--red)', fontSize: 12 }}>{authError}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            className="tap"
            onClick={login}
            disabled={authLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '14px 20px', borderRadius: 13, border: '1.5px solid var(--s-border)',
              background: authLoading ? 'var(--surface2)' : 'var(--surface2)',
              color: 'var(--text)', fontSize: 15, fontWeight: 700,
              cursor: authLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginBottom: 14,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
            onMouseEnter={e => { if (!authLoading) { e.currentTarget.style.background = 'var(--s-hi)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.transform = 'none'; }}
          >
            {authLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : <GoogleIcon />}
            {authLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Security note */}
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ color: 'var(--text3)', fontSize: 11 }}>
              Secured by Firebase Authentication · Google OAuth 2.0
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text3)', fontSize: 11, lineHeight: 1.8 }}>
          OJT Tracker · Built with React + Firebase<br />
          <span style={{ opacity: 0.6 }}>Data stored in Firestore · Vercel Deployment</span>
        </div>
      </div>
    </div>
  );
}
