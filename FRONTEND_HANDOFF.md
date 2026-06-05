# Cloud Share — Frontend Redesign Handoff

## What this project is

File-sharing platform. Users upload files to Supabase Storage via pre-signed URLs, manage/share them, buy credits via Razorpay. Built with Spring Boot backend + React frontend.

**Live URLs:**
- Frontend: https://cloudsharewebapp-eight.vercel.app
- Backend API: https://cloud-share-api-ffmt.onrender.com/api/v1.0
- Repo: https://github.com/princesatapathy/cloud-share

---

## What needs to happen

### 1. Migrate JSX → TypeScript (.tsx)

Current: `cloudsharewebapp/` is plain React + Vite + JSX (no types).
Target: Full TypeScript with strict mode.

**Steps:**
- Rename all `.jsx` → `.tsx`, `.js` → `.ts`
- Add `tsconfig.json` with `"strict": true`
- Type all props, state, context, API responses
- Type the Supabase client + Clerk hooks

### 2. Redesign all pages

Modern SaaS look. Think Notion/Linear/Dropbox aesthetic. Dark sidebar, light content. Clean typography, generous whitespace.

---

## Current file structure

```
cloudsharewebapp/
├── src/
│   ├── App.jsx                    → App.tsx
│   ├── main.jsx                   → main.tsx
│   ├── pages/
│   │   ├── Landing.jsx            → Landing.tsx
│   │   ├── Dashboard.jsx          → Dashboard.tsx
│   │   ├── Upload.jsx             → Upload.tsx
│   │   ├── MyFiles.jsx            → MyFiles.tsx
│   │   ├── Subscription.jsx       → Subscription.tsx
│   │   ├── Transactions.jsx       → Transactions.tsx
│   │   └── PublicFileView.jsx     → PublicFileView.tsx
│   ├── components/
│   │   ├── UploadBox.jsx          → UploadBox.tsx
│   │   ├── FileCard.jsx           → FileCard.tsx
│   │   ├── FileListRow.jsx        → FileListRow.tsx
│   │   ├── DashboardUpload.jsx    → DashboardUpload.tsx
│   │   ├── RecentFiles.jsx        → RecentFiles.tsx
│   │   ├── ConfirmationDialog.jsx → ConfirmationDialog.tsx
│   │   └── LinkShareModal.jsx     → LinkShareModal.tsx
│   ├── layout/
│   │   └── DashboardLayout.jsx    → DashboardLayout.tsx
│   ├── context/
│   │   └── UserCreditsContext.jsx  → UserCreditsContext.tsx
│   ├── util/
│   │   ├── apiEndpoints.js        → apiEndpoints.ts
│   │   └── supabaseClient.js      → supabaseClient.ts
│   └── assets/
│       └── data.js                → data.ts
├── .env
├── package.json
├── vite.config.js                 → vite.config.ts
└── tailwind.config.js
```

---

## Tech stack

| Library | Purpose | Docs |
|---|---|---|
| React 18 | UI framework | |
| Vite | Build tool | |
| Tailwind CSS | Styling | |
| @clerk/clerk-react | Auth (SignedIn/SignedOut guards, useAuth, useUser) | https://clerk.com/docs/references/react |
| @supabase/supabase-js | Direct file upload via pre-signed URLs | https://supabase.com/docs/reference/javascript |
| axios | API calls to Spring Boot backend | |
| react-router-dom v6 | Client-side routing | |
| react-hot-toast | Toast notifications | |
| lucide-react | Icons | https://lucide.dev |

---

## Auth flow

- Clerk handles login/signup (OAuth, email/password)
- `useAuth().getToken()` returns JWT
- All API calls to backend include `Authorization: Bearer <token>`
- Protected routes wrapped with `<Show when="signed-in" fallback={<RedirectToSignIn />}>`
- Public routes: `/` (landing), `/file/:fileId` (shared file view)

---

## Upload flow (critical — don't break this)

```
1. Frontend calls POST /files/upload/initiate with {fileName, mimeType, fileSize}
   → Backend validates type + checks credits
   → Returns {uploadUrl, token, supabasePath}

2. Frontend calls supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
   → File goes directly to Supabase CDN (server never touches bytes)

3. Frontend calls POST /files/upload/finalize with {supabasePath, name, type, size}
   → Backend saves metadata to MongoDB + deducts 1 credit
   → Returns {file, remainingCredits}
```

Both `Upload.tsx` and `Dashboard.tsx` have this flow. Currently duplicated — should be extracted to a shared hook: `useFileUpload()`.

---

## API endpoints (all in `apiEndpoints.ts`)

```typescript
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1.0").replace(/\/$/, "");

export const apiEndpoints = {
    FETCH_FILES: `${BASE_URL}/files/my`,
    GET_CREDITS: `${BASE_URL}/users/credits`,
    TOGGLE_FILE: (id: string) => `${BASE_URL}/files/${id}/toggle-public`,
    DOWNLOAD_FILE: (id: string) => `${BASE_URL}/files/download/${id}`,
    DELETE_FILE: (id: string) => `${BASE_URL}/files/${id}`,
    INITIATE_UPLOAD: `${BASE_URL}/files/upload/initiate`,
    FINALIZE_UPLOAD: `${BASE_URL}/files/upload/finalize`,
    CREATE_ORDER: `${BASE_URL}/payments/create-order`,
    VERIFY_PAYMENT: `${BASE_URL}/payments/verify-payment`,
    TRANSACTIONS: `${BASE_URL}/transactions`,
    PUBLIC_FILE_VIEW: (fileId: string) => `${BASE_URL}/files/public/${fileId}`,
};
```

---

## Key types to define

```typescript
interface FileMetadata {
    id: string;
    name: string;
    type: string;
    size: number;
    clerkId: string;
    isPublic: boolean;
    fileUrl: string;
    uploadedAt: string; // ISO datetime
}

interface UserCredits {
    clerkId: string;
    credits: number;
    plan: string; // "BASIC" | "PREMIUM" | "ULTIMATE"
}

interface PaymentTransaction {
    id: string;
    orderId: string;
    paymentId: string;
    planId: string;
    amount: number; // in paise (divide by 100 for rupees)
    currency: string;
    creditsAdded: number;
    status: string;
    transactionDate: string;
}

interface InitiateUploadResponse {
    uploadUrl: string;
    token: string;
    supabasePath: string;
}

interface FinalizeUploadResponse {
    file: FileMetadata;
    remainingCredits: number;
}
```

---

## Environment variables (frontend)

```
VITE_API_BASE_URL=https://cloud-share-api-ffmt.onrender.com/api/v1.0
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29vbC1zbmlwZS05Ny5jbGVyay5hY2NvdW50cy5kZXYk
VITE_RAZORPAY_KEY=rzp_test_Su2Qmczza6uFwP
VITE_SUPABASE_URL=https://vdnjqyqkvmdprvhqovon.supabase.co
VITE_SUPABASE_ANON_KEY=<set in Vercel>
VITE_SUPABASE_BUCKET=cloud-share
```

---

## Pages to redesign

### 1. Landing `/`
- Hero section with CTA → sign up
- Features grid (upload, share, credits system)
- Pricing preview (Premium ₹500/500 credits, Ultimate ₹2500/5000 credits)
- Testimonials (data in `assets/data.ts`)

### 2. Dashboard `/dashboard`
- Left: compact upload widget (drag-drop + file list + upload button)
- Right: recent files (last 5, sorted by uploadedAt desc)
- Top: greeting + credit badge

### 3. Upload `/upload`
- Full-width drag-drop zone
- Selected files list with per-file progress bars
- Credit counter (X credits remaining)
- File type restrictions shown (PDF, images, video, audio, docs, zip)

### 4. My Files `/my-files`
- List/grid toggle (currently working)
- Each file: name, size, date, sharing toggle, download, delete, share link
- Confirmation dialog on delete
- Share modal with copy-to-clipboard

### 5. Subscriptions `/subscriptions`
- Current plan badge + credit counter
- Two pricing cards: Premium + Ultimate
- Razorpay checkout modal on "Purchase"

### 6. Transactions `/transactions`
- Table: date, plan, amount (₹), credits added, payment ID
- Empty state when no transactions

### 7. Public File View `/file/:fileId`
- No auth required
- File info card: name, size, type, shared date
- Download button
- Share link button

---

## Design constraints

- Tailwind CSS utility classes only (no external UI libraries)
- Lucide icons only
- Must be responsive (mobile-first)
- WCAG AA contrast
- Dark sidebar (~gray-900), light content area (~gray-50)
- Accent: purple (current) or switch with reasoning
- Loading states on all async operations
- Empty states on all list views
- Error states with user-friendly messages

---

## Branch

Work on branch: `sidetree`

```bash
git checkout sidetree
```

---

## Build & run

```bash
cd cloudsharewebapp
npm install
npm run dev     # dev server on :5173
npm run build   # production build
```

---

## Known issues to fix during redesign

1. Upload logic duplicated between `Dashboard.jsx` and `Upload.jsx` → extract to `hooks/useFileUpload.ts`
2. `console.log('data', fileToUpdate)` left in `MyFiles.jsx` line 48 → remove
3. `useEffect` deps on `[getToken]` → should be `[]` (mount only)
4. No error boundary wrapping routes → add one
5. No TypeScript → migrate all files
6. No dark mode toggle (optional)
