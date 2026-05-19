// ── hooks/useAuth.jsx ────────────────────────────────────────────
// Firebase Authentication context — Google Sign-In only.
// No more username/password stored in GAS UserAccounts sheet.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  upsertUserProfile,
  getUserProfile,
  addLoginLog,
} from '../lib/firebase.js';
import { genId } from '../lib/utils.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [userProfile,  setUserProfile]  = useState(null);
  const [authError,    setAuthError]    = useState('');
  const [authLoading,  setAuthLoading]  = useState(false);

  // ── Firebase auth state listener ───────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Load or create user profile in Firestore
        let profile = await getUserProfile(fbUser.uid);
        if (!profile) {
          // First-time Google sign-in → create profile
          profile = {
            displayName: fbUser.displayName,
            email:       fbUser.email,
            photoURL:    fbUser.photoURL,
            role:        'user',        // owner can change to 'owner' in Firestore console
            accountId:   fbUser.uid,
            createdAt:   new Date().toISOString(),
          };
          await upsertUserProfile(fbUser.uid, profile);
        }
        setUserProfile({ ...profile, uid: fbUser.uid });
      } else {
        setUserProfile(null);
      }
    });
    return unsub;
  }, []);

  // ── Google Sign-In ─────────────────────────────────────────────
  const login = useCallback(async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await signInWithGoogle();
      const user   = result.user;
      // Log the sign-in event to Firestore
      await addLoginLog(user.uid, {
        id:        genId(),
        event:     'LOGIN',
        ts:        new Date().toISOString(),
        firstName: user.displayName?.split(' ')[0] || '',
        username:  user.email,
      });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('Sign-in failed. Please try again.');
        console.error('[Auth]', err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ── Sign Out ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (firebaseUser) {
      await addLoginLog(firebaseUser.uid, {
        id:        genId(),
        event:     'LOGOUT',
        ts:        new Date().toISOString(),
        firstName: userProfile?.displayName?.split(' ')[0] || '',
        username:  firebaseUser.email,
      });
    }
    await signOutUser();
  }, [firebaseUser, userProfile]);

  const isLoading = firebaseUser === undefined; // still initializing
  const isOwner   = userProfile?.role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        isLoading,
        isOwner,
        authLoading,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
