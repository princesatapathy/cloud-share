# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Monorepo with two sub-projects:

- **`cloudshareapi/`** — Spring Boot 3 REST API (Java, Maven)
- **`cloudsharewebapp/`** — Vite + React frontend (JSX)

Backend deploys to Render; frontend deploys to Vercel (config in `vercel.json`).

## Commands

### Backend (`cloudshareapi/`)

```powershell
cd cloudshareapi
.\mvnw.cmd spring-boot:run   # start API on :8080
.\mvnw.cmd test              # run all tests
.\mvnw.cmd package           # build JAR
```

API base: `http://localhost:8080/api/v1.0`  
Health: `http://localhost:8080/api/v1.0/health`

### Frontend (`cloudsharewebapp/`)

```powershell
cd cloudsharewebapp
npm install
npm run dev    # dev server
npm run build  # production build
```

Root-level `package.json` scripts proxy to the webapp:
- `npm run build` → `npm --prefix cloudsharewebapp run build`
- `npm run install:web` → `npm --prefix cloudsharewebapp ci`

## Backend Architecture

**Package root:** `in.macvillan.cloudshareapi`

**Layers:**
- `controller/` — REST endpoints (File, Profile, Payment, UserCredits, Transaction, ClerkWebhook, Health)
- `service/` — Business logic (FileMetadataService, PaymentService, UserCreditsService, ProfileService)
- `repository/` — Spring Data MongoDB repos
- `document/` — MongoDB documents (entities)
- `dto/` — Request/response transfer objects
- `security/` — Clerk JWT filter + JWKS provider
- `config/` — SecurityConfig, StaticResourceConfig

**Auth flow:** `ClerkJwtAuthFilter` intercepts every request, extracts JWT, resolves the signing key via `ClerkJwksProvider` (fetches Clerk JWKS by `kid`), validates issuer, and sets `clerkId` (JWT `sub`) as the Spring Security principal. Controllers retrieve the authenticated user via `SecurityContextHolder`.

**Public (unauthenticated) routes:** `/webhooks/**`, `/files/public/**`, `/files/download/**`, `/health`

**File storage:** Files are stored on the **local filesystem** in an `upload/` directory relative to the working directory — not in cloud object storage. `FileMetadataDocument` stores the absolute path.

**Credit system:**
- New users get 5 free credits (created on first access or via Clerk `user.created` webhook)
- Each file upload costs 1 credit
- Plans: `premium` → 500 credits; `ultimate` → 5000 credits
- Payments via Razorpay; signature verified with HMAC-SHA256 in `PaymentService`

**Webhook:** `ClerkWebhookController` handles `user.created`, `user.updated`, `user.deleted` events from Clerk (via Svix headers). ⚠️ `verifyWebhookSignature` is currently a stub that always returns `true`.

## Frontend Architecture

**Auth:** `@clerk/clerk-react` — `<SignedIn>/<SignedOut>` guards protect all dashboard routes. Clerk token attached to API requests via `useAuth().getToken()`.

**Global state:** `UserCreditsContext` (`src/context/UserCreditsContext.jsx`) provides credit count across the app.

**API calls:** All endpoints centralized in `src/util/apiEndpoints.js`, reads `VITE_API_BASE_URL`.

**Routes:** `/` (landing), `/dashboard`, `/upload`, `/my-files`, `/subscriptions`, `/transactions`, `/file/:fileId` (public, no auth)

**Pricing data / nav items:** Defined in `src/assets/data.js` (plans, features, testimonials, sidebar nav).

## Environment Variables

### Backend
| Variable | Default | Purpose |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/cloudshare` | MongoDB connection |
| `CLERK_ISSUER` | dev domain | JWT issuer validation |
| `CLERK_JWKS_URL` | dev domain | Public key fetch |
| `CLERK_WEBHOOK_SECRET` | (empty) | Svix webhook validation |
| `RAZORPAY_KEY_ID` | (empty) | Razorpay API |
| `RAZORPAY_KEY_SECRET` | (empty) | Razorpay signature |

File size limits: 5MB per file, 25MB per request (configured in `application.properties`).

### Frontend
| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (strip trailing slash handled in code) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `VITE_RAZORPAY_KEY` | Razorpay checkout key |
