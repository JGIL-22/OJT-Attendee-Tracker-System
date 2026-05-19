# OJT Tracker — Migration Guide
## Google Apps Script → React + Firebase + Vercel

---

## What Changed

| Before (Google Apps Script) | After (Firebase + Vercel) |
|---|---|
| `SCRIPT_URL` + `SCRIPT_SECRET` hardcoded in HTML | Firebase config in `.env.local` |
| Username/password stored in GAS UserAccounts sheet | **Google OAuth 2.0** via Firebase Auth |
| `apiGet()` / `apiPost()` / `jsonpGet()` | Firestore real-time subscriptions |
| `simpleHash()` password hashing | Firebase handles auth securely |
| `localStorage` offline queue | Firestore IndexedDB persistence (automatic) |
| Single HTML file | Vite + React project (component files) |
| Deployed as GAS Web App URL | Deployed to **Vercel** |

---

## 1. Firebase Project Setup

### A. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `ojt-tracker` → Continue
3. Disable Google Analytics (optional) → **Create project**

### B. Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Click **Sign-in method** → Enable **Google**
3. Set your support email → **Save**

### C. Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → Select region (e.g., `asia-southeast1` for PH)
3. Click **Create**

### D. Deploy Security Rules

Copy `firestore.rules` to your Firebase project:

```bash
# Install Firebase CLI if not already
npm install -g firebase-tools

# Login and init
firebase login
firebase init firestore   # select your project, accept defaults

# Deploy rules
firebase deploy --only firestore:rules
```

### E. Get Firebase Config

1. Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **Web** (`</>`) icon
3. Register app as `ojt-tracker-web`
4. Copy the `firebaseConfig` values

---

## 2. Local Development Setup

```bash
# Clone or unzip the project
cd ojt-tracker

# Install dependencies
npm install

# Create your local env file (NEVER commit this)
cp .env.example .env.local
```

Edit `.env.local` with your real Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ojt-tracker-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ojt-tracker-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=ojt-tracker-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...

VITE_OJT_TOTAL_HOURS=500
VITE_OJT_START_DATE=2026-03-03
VITE_OJT_HOURS_PER_DAY=8
```

```bash
# Run locally
npm run dev
# → Opens at http://localhost:5173
```

---

## 3. Setting Yourself as Owner

After signing in for the first time with your Gmail:

1. Go to **Firebase Console → Firestore Database**
2. Browse to `users/{your-uid}`
3. Edit the `role` field → change from `"user"` to `"owner"`
4. Save

The owner role grants:
- Full read access to all users' data
- Ability to delete any session or absent record
- Ability to write the shared schedule
- Admin view in the Settings tab

---

## 4. Adding Users / Restricting Access

Firebase Auth with Google Sign-In means **anyone with a Gmail can sign in** by default.

### Option A — Whitelist specific emails (Recommended)

Add this to `src/lib/firebase.js` after `onAuthStateChanged`:

```js
// In the onAuthStateChanged callback, after getting fbUser:
const ALLOWED_EMAILS = [
  'you@gmail.com',
  'coworker@gmail.com',
  // Add all allowed Gmail addresses here
];

if (fbUser && !ALLOWED_EMAILS.includes(fbUser.email)) {
  await signOut(auth);
  // Show error to user
  return;
}
```

### Option B — Firebase Identity Platform (paid)

Upgrade to Firebase Identity Platform for domain-based restrictions.

### Option C — Leave open (trusted users only)

If you share the URL only with your OJT group, just leave it open.

---

## 5. Schedule Data (replaces Google Sheets Sheet1)

The schedule is now stored in **Firestore** at `schedule/main`.

### Option A — Paste directly in Firestore Console

1. Go to Firestore → `schedule/main`
2. Add a field `rows` (Array) with objects like:
```json
[
  { "Date": "2026-03-03", "Event/Notes": "Orientation" },
  { "Date": "2026-03-04", "Event/Notes": "" },
  ...
]
```

### Option B — Import from CSV/Excel (programmatic)

Create a one-time script `scripts/importSchedule.js`:

```js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import scheduleData from './schedule.json';

// Initialize with your config...
// Then:
await setDoc(doc(db, 'schedule', 'main'), { rows: scheduleData });
```

---

## 6. Deploy to Vercel

### A. Push to GitHub

```bash
git init
git add .
git commit -m "Initial OJT Tracker (Firebase + Vite)"
git remote add origin https://github.com/yourusername/ojt-tracker.git
git push -u origin main
```

### B. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. **Environment Variables** — add all your `VITE_*` values from `.env.local`
5. Click **Deploy**

Your app is now live at `https://ojt-tracker.vercel.app` (or custom domain).

### C. Add Vercel URL to Firebase Auth

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain (e.g., `ojt-tracker.vercel.app`)

---

## 7. Security Checklist

- [ ] `.env.local` is in `.gitignore` (never pushed to GitHub)
- [ ] Firebase API key is restricted in Google Cloud Console (HTTP referrers)
- [ ] Firestore security rules deployed (`firestore.rules`)
- [ ] Owner role set in Firestore for your account
- [ ] Authorized domains configured in Firebase Auth
- [ ] Email whitelist added (if needed)

---

## 8. Firestore Data Structure

```
Firestore Root
├── users/
│   └── {uid}/                    ← Google Auth UID
│       ├── displayName: "..."
│       ├── email: "...@gmail.com"
│       ├── photoURL: "https://..."
│       ├── role: "owner" | "user"
│       └── accountId: {uid}
│
├── attendance/
│   └── {uid}/
│       ├── sessions/
│       │   └── {docId}/
│       │       ├── actualTimeIn: ISO string
│       │       ├── actualTimeOut: ISO string
│       │       ├── timeIn: ISO string
│       │       ├── timeOut: ISO string
│       │       ├── duration: number (ms)
│       │       └── note: string
│       └── absents/
│           └── {docId}/
│               ├── date: "YYYY-MM-DD"
│               ├── type: "absent" | "leave"
│               ├── reason: string
│               └── loggedAt: ISO string
│
├── loginLogs/
│   └── {uid}/events/
│       └── {docId}/
│           ├── event: "LOGIN" | "LOGOUT"
│           ├── ts: ISO string
│           └── username: email
│
├── schedule/
│   └── main/
│       └── rows: [ { Date, Event/Notes }, ... ]
│
└── settings/
    └── {uid}/
        ├── theme: "dark" | "light"
        ├── h24: boolean
        ├── calView: "paged" | "scroll" | "heatmap"
        ├── reqHours: number
        └── workWeekends: boolean
```

---

## 9. Recommended Tech Stack (Already Included)

| Layer | Technology | Why |
|---|---|---|
| **UI Framework** | React 18 + Vite | Fast HMR, component-based |
| **Auth** | Firebase Authentication | Google OAuth, secure, free tier |
| **Database** | Firestore | Real-time, offline, scalable |
| **Offline** | Firestore IndexedDB persistence | Works without network |
| **Deployment** | Vercel | Git-based deploys, free tier, global CDN |
| **Routing** | React Router v6 | Client-side navigation |
| **Security** | Firestore Rules + CSP headers | No exposed secrets |

---

## 10. Removed Completely

The following are **permanently removed** — no references remain:

- `SCRIPT_URL` constant
- `SCRIPT_SECRET` constant  
- `apiGet()` function
- `apiGetWithId()` function
- `apiPost()` function
- `jsonpGet()` function (JSONP hack)
- `enqueue()` / `flushQueue()` (manual offline queue)
- `isReady()` check
- `simpleHash()` password hashing
- `verifyLogin` action
- `addAttendance` / `updateAttendance` / `addUserAttendance` GAS actions
- Google Apps Script `Code.gs` dependency
- UserAccounts Google Sheet dependency
- Setup Required banner
