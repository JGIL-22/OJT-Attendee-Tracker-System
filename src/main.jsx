// ── main.jsx ──────────────────────────────────────────────────────
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import './index.css';

// ── App root — shows login or dashboard based on Firebase auth state
function App() {
  const { firebaseUser, isLoading } = useAuth();

  if (isLoading) {
    // Firebase is still determining auth state — show minimal loading screen
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, background: 'var(--bg)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg,var(--teal),var(--sky))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.4s ease infinite',
        }}>
          <svg width="26" height="26" viewBox="0 0 38 38" fill="none">
            <rect x="6" y="7" width="26" height="28" rx="3" stroke="white" strokeWidth="2" strokeOpacity="0.9"/>
            <circle cx="19" cy="17" r="3" fill="white" opacity="0.9"/>
            <path d="M12 27c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
          </svg>
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 13 }}>Initializing OJT Tracker…</div>
      </div>
    );
  }

  return firebaseUser ? <Dashboard /> : <Login />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
