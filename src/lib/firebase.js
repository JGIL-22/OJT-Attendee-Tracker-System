// ── lib/firebase.js ───────────────────────────────────────────────
// Firebase v10 SDK — replaces ALL Google Apps Script (GAS) calls.
// Auth  → Google Sign-In via Firebase Authentication
// Data  → Firestore (real-time, offline-capable, no server needed)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

// ── Config (from .env.local) ─────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Enable offline persistence (IndexedDB) — works even without network
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence only works in one tab at a time
    console.warn('[Firestore] Persistence unavailable (multiple tabs)');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firestore] Persistence not supported in this browser');
  }
});

// ── Google Auth Provider ─────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser      = () => signOut(auth);
export { onAuthStateChanged };

// ── Firestore Helpers ────────────────────────────────────────────
// Firestore Collection Schema:
//
//   users/{uid}                      → profile: {displayName, email, photoURL, role, accountId, createdAt}
//   attendance/{uid}/sessions/{id}   → {timeIn, timeOut, actualTimeIn, actualTimeOut, duration, note, createdAt}
//   attendance/{uid}/absents/{id}    → {date, type, reason, loggedAt}
//   loginLogs/{uid}/events/{id}      → {event, ts, username, firstName}
//   schedule/                        → {rows: [...]} — shared, managed by owner
//   settings/{uid}                   → {theme, h24, calView, reqHours, workWeekends}

// ── User Profile ─────────────────────────────────────────────────
export async function upsertUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Attendance Sessions ──────────────────────────────────────────
export async function addSession(uid, session) {
  const ref = collection(db, 'attendance', uid, 'sessions');
  return addDoc(ref, { ...session, createdAt: serverTimestamp() });
}

export async function updateSession(uid, sessionId, data) {
  const ref = doc(db, 'attendance', uid, 'sessions', sessionId);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSession(uid, sessionId) {
  return deleteDoc(doc(db, 'attendance', uid, 'sessions', sessionId));
}

export function subscribeToSessions(uid, callback) {
  const ref = collection(db, 'attendance', uid, 'sessions');
  const q   = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

// ── Absents / Leaves ─────────────────────────────────────────────
export async function addAbsent(uid, absent) {
  const ref = collection(db, 'attendance', uid, 'absents');
  return addDoc(ref, { ...absent, createdAt: serverTimestamp() });
}

export async function deleteAbsent(uid, absentId) {
  return deleteDoc(doc(db, 'attendance', uid, 'absents', absentId));
}

export function subscribeToAbsents(uid, callback) {
  const ref = collection(db, 'attendance', uid, 'absents');
  const q   = query(ref, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

// ── Login Logs ───────────────────────────────────────────────────
export async function addLoginLog(uid, log) {
  const ref = collection(db, 'loginLogs', uid, 'events');
  return addDoc(ref, { ...log, createdAt: serverTimestamp() });
}

export function subscribeToLoginLogs(uid, callback) {
  const ref = collection(db, 'loginLogs', uid, 'events');
  const q   = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

// ── Schedule (shared, owner-editable) ────────────────────────────
export async function getSchedule() {
  const snap = await getDoc(doc(db, 'schedule', 'main'));
  return snap.exists() ? snap.data().rows || [] : [];
}

export async function setSchedule(rows) {
  await setDoc(doc(db, 'schedule', 'main'), { rows, updatedAt: serverTimestamp() });
}

// ── User Settings ────────────────────────────────────────────────
export async function saveSettings(uid, settings) {
  await setDoc(doc(db, 'settings', uid), settings, { merge: true });
}

export async function loadSettings(uid) {
  const snap = await getDoc(doc(db, 'settings', uid));
  return snap.exists() ? snap.data() : null;
}
