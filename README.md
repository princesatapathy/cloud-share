# Cloud Share

A full-stack cloud file sharing platform with a credit-based upload system, Clerk authentication, and Razorpay payments.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend — cloudshareapi](#backend--cloudshareapi)
  - [Technology Stack](#backend-technology-stack)
  - [Project Structure](#backend-project-structure)
  - [Authentication & Security](#authentication--security)
  - [API Endpoints](#api-endpoints)
  - [Credit System](#credit-system)
  - [Payment Flow](#payment-flow)
  - [File Storage](#file-storage)
  - [MongoDB Collections](#mongodb-collections)
  - [Configuration](#backend-configuration)
  - [Running Locally](#running-the-backend-locally)
  - [Docker](#docker)
- [Frontend — cloudsharewebapp](#frontend--cloudsharewebapp)
  - [Technology Stack](#frontend-technology-stack)
  - [Project Structure](#frontend-project-structure)
  - [Routing & Auth Guards](#routing--auth-guards)
  - [State Management](#state-management)
  - [Configuration](#frontend-configuration)
  - [Running Locally](#running-the-frontend-locally)
- [Deployment](#deployment)

---

## Overview

Cloud Share lets authenticated users upload files, manage them, toggle public/private access, and share direct download links. Access to upload is gated by a credit system — each file upload costs 1 credit. Users can purchase credit bundles via Razorpay.

---

## Architecture

```
cloud-share/
├── cloudshareapi/        # Spring Boot REST API
├── cloudsharewebapp/     # Vite + React SPA
├── package.json          # Root scripts (delegates to webapp)
└── vercel.json           # Vercel deployment config for frontend
```

```
Browser (React + Clerk)
        │  JWT (Bearer token)
        ▼
Spring Boot API  (/api/v1.0)
        │
        ├── ClerkJwtAuthFilter   ← validates RS256 JWT via Clerk JWKS
        │
        ├── FileController       ← upload / list / delete / toggle-public / download
        ├── PaymentController    ← Razorpay order creation & verification
        ├── UserCreditsController
        ├── TransactionController
        ├── ProfileController
        └── ClerkWebhookController  ← syncs Clerk user events to MongoDB
                │
                ▼
           MongoDB
           ├── profiles
           ├── files
           ├── user_credits
           └── payment_transactions
```

---

## Backend — cloudshareapi

### Backend Technology Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3 |
| Language | Java 21 |
| Build | Maven (wrapper included) |
| Database | MongoDB (Spring Data MongoDB) |
| Auth | Clerk (RS256 JWT via JWKS) |
| Payments | Razorpay Java SDK |
| Lombok | Boilerplate reduction |
| Container | Docker (multi-stage, Eclipse Temurin 21) |

### Backend Project Structure

```
cloudshareapi/src/main/java/in/macvillan/cloudshareapi/
├── CloudshareapiApplication.java
├── config/
│   ├── SecurityConfig.java          # Spring Security filter chain, CORS
│   └── StaticResourceConfig.java
├── controller/
│   ├── FileController.java          # /files/**
│   ├── PaymentController.java       # /payments/**
│   ├── UserCreditsController.java   # /users/credits
│   ├── TransactionController.java   # /transactions
│   ├── ProfileController.java       # /profile/**
│   ├── ClerkWebhookController.java  # /webhooks/clerk
│   └── HealthController.java        # /health
├── service/
│   ├── FileMetadataService.java
│   ├── PaymentService.java
│   ├── UserCreditsService.java
│   └── ProfileService.java
├── repository/                      # Spring Data MongoDB interfaces
├── document/                        # MongoDB @Document classes
│   ├── FileMetadataDocument.java
│   ├── ProfileDocument.java
│   ├── UserCredits.java
│   └── PaymentTransaction.java
├── dto/                             # Request / response DTOs
└── security/
    ├── ClerkJwtAuthFilter.java      # OncePerRequestFilter — JWT validation
    └── ClerkJwksProvider.java       # Fetches & caches Clerk public keys (1h TTL)
```

### Authentication & Security

All protected endpoints require a `Bearer` JWT issued by Clerk.

**Filter chain:**

1. `ClerkJwtAuthFilter` extracts the `kid` from the JWT header.
2. `ClerkJwksProvider` fetches (and in-memory caches for 1 hour) RSA public keys from the Clerk JWKS URL.
3. The JWT is verified: signature, issuer, and clock skew (±60 s).
4. On success, `clerkId` (the JWT `sub` claim) is set as the Spring Security principal — available in services via `SecurityContextHolder`.

**Public routes (no auth required):**

| Route | Purpose |
|---|---|
| `GET /health` | Health check |
| `GET /files/public/{id}` | View public file metadata |
| `GET /files/download/{id}` | Download any file by ID |
| `POST /webhooks/clerk` | Clerk user lifecycle events |

**CORS:** All origins allowed with credentials (`Authorization`, `Content-Type` headers). Tighten this in production.

### API Endpoints

All endpoints are prefixed with `/api/v1.0`.

#### Files

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/files/upload` | ✅ | Upload files (multipart, field `files[]`) |
| `GET` | `/files/my` | ✅ | List current user's files |
| `DELETE` | `/files/{id}` | ✅ | Delete a file (owner only) |
| `PATCH` | `/files/{id}/toggle-public` | ✅ | Toggle public/private |
| `GET` | `/files/public/{id}` | ❌ | Get metadata for a public file |
| `GET` | `/files/download/{id}` | ❌ | Download a file |

#### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/create-order` | ✅ | Create Razorpay order |
| `POST` | `/payments/verify-payment` | ✅ | Verify signature & credit user |

#### Other

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users/credits` | ✅ | Get current user's credit balance |
| `GET` | `/transactions` | ✅ | List user's payment transactions |
| `GET` | `/health` | ❌ | Health check |
| `POST` | `/webhooks/clerk` | ❌ | Clerk webhook (Svix signed) |

### Credit System

- New users receive **5 free credits** — created on first `GET /users/credits` call or via the Clerk `user.created` webhook.
- Each file upload deducts **1 credit**.
- Credit check happens before any upload; insufficient credits returns a `RuntimeException` with a user-facing message.

**Plans:**

| Plan | Credits | Price (INR) |
|---|---|---|
| Free / Basic | 5 (initial) | ₹0 |
| Premium | +500 | ₹500 |
| Ultimate | +5000 | ₹2500 |

### Payment Flow

```
Frontend                           Backend                        Razorpay
   │                                  │                               │
   │── POST /payments/create-order ──►│                               │
   │    { amount, currency, planId }  │── create order ──────────────►│
   │                                  │◄── orderId ───────────────────│
   │◄── { orderId } ──────────────────│                               │
   │                                  │                               │
   │  [Razorpay Checkout opens]        │                               │
   │─────────────────────────────────────────── user pays ───────────►│
   │◄── { razorpay_order_id,           │                               │
   │      razorpay_payment_id,         │                               │
   │      razorpay_signature }         │                               │
   │                                  │                               │
   │── POST /payments/verify-payment ►│                               │
   │                                  │ HMAC-SHA256 verify signature  │
   │                                  │ addCredits(clerkId, credits)  │
   │◄── { success, credits }──────────│                               │
```

Signature verification uses HMAC-SHA256: `sign(orderId + "|" + paymentId, razorpayKeySecret)`.

### File Storage

Files are stored on the **local filesystem** in an `upload/` directory relative to the API working directory. `FileMetadataDocument` stores the absolute path. This means:
- On Render (Render's ephemeral disk or persistent disk must be configured).
- Files are served directly from disk via `UrlResource`.
- Max upload: **5 MB per file**, **25 MB per request**.

### MongoDB Collections

| Collection | Document class | Key fields |
|---|---|---|
| `profiles` | `ProfileDocument` | `clerkId`, `email`, `firstName`, `lastName`, `photoUrl` |
| `files` | `FileMetadataDocument` | `clerkId`, `name`, `type`, `size`, `fileLocation`, `isPublic`, `uploadedAt` |
| `user_credits` | `UserCredits` | `clerkId`, `credits`, `plan` |
| `payment_transactions` | `PaymentTransaction` | `clerkId`, `orderId`, `paymentId`, `planId`, `amount`, `status`, `creditsAdded` |

### Backend Configuration

Copy `application.example.properties` and set environment variables:

```properties
MONGODB_URI=mongodb://localhost:27017/cloudshare
CLERK_ISSUER=https://<your-clerk-domain>.clerk.accounts.dev
CLERK_JWKS_URL=https://<your-clerk-domain>.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=<svix-webhook-secret>
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
```

### Running the Backend Locally

```powershell
cd cloudshareapi
.\mvnw.cmd spring-boot:run
```

Health check: `http://localhost:8080/api/v1.0/health`

Run tests:

```powershell
.\mvnw.cmd test
```

### Docker

```bash
cd cloudshareapi
docker build -t cloudshareapi .
docker run -p 8080:8080 \
  -e MONGODB_URI=... \
  -e CLERK_ISSUER=... \
  -e CLERK_JWKS_URL=... \
  -e RAZORPAY_KEY_ID=... \
  -e RAZORPAY_KEY_SECRET=... \
  cloudshareapi
```

Multi-stage build: Maven 3.9.6 + Eclipse Temurin 21 for build, Eclipse Temurin 21 JDK Jammy for runtime.

---

## Frontend — cloudsharewebapp

### Frontend Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (JSX) |
| Build tool | Vite |
| Auth | `@clerk/clerk-react` |
| HTTP | Axios |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Payments | Razorpay JS SDK |

### Frontend Project Structure

```
cloudsharewebapp/src/
├── main.jsx                      # Entry — wraps app in <ClerkProvider>
├── App.jsx                       # Router + auth guards
├── context/
│   └── UserCreditsContext.jsx    # Global credit state, fetchUserCredits()
├── util/
│   └── apiEndpoints.js           # All API URLs derived from VITE_API_BASE_URL
├── pages/
│   ├── Landing.jsx               # Public marketing page
│   ├── Dashboard.jsx             # Overview + recent files
│   ├── Upload.jsx                # Drag-and-drop upload
│   ├── MyFiles.jsx               # File list with manage actions
│   ├── Subscription.jsx          # Pricing + Razorpay checkout
│   ├── Transactions.jsx          # Payment history
│   └── PublicFileView.jsx        # Unauthenticated file view/download
├── components/
│   ├── Navbar.jsx
│   ├── SideMenu.jsx
│   ├── UploadBox.jsx
│   ├── FileCard.jsx / FileListRow.jsx
│   ├── CreditsDisplay.jsx
│   ├── LinkShareModal.jsx        # Generates shareable public link
│   ├── ConfirmationDialog.jsx
│   ├── RecentFiles.jsx
│   ├── DashboardUpload.jsx
│   └── landing/                  # HeroSection, FeaturesSection, PricingSection, etc.
├── layout/
│   └── DashboardLayout.jsx       # Shell with SideMenu + Navbar
└── assets/
    ├── data.js                   # Pricing plans, features, testimonials, nav items
    └── assets.js
```

### Routing & Auth Guards

```
/                   → Landing (public)
/dashboard          → Dashboard (auth required)
/upload             → Upload (auth required)
/my-files           → MyFiles (auth required)
/subscriptions      → Subscription (auth required)
/transactions       → Transactions (auth required)
/file/:fileId       → PublicFileView (public)
/*                  → RedirectToSignIn
```

Protected routes use Clerk's `<SignedIn>` / `<SignedOut>` + `<RedirectToSignIn>` pattern. No custom route wrapper needed.

### State Management

**`UserCreditsContext`** is the only global state:
- Fetches credit balance from `GET /users/credits` on sign-in.
- `fetchUserCredits()` can be called from any component after an upload or payment to refresh the count.
- `updateCredits(n)` for optimistic local updates.

All API calls attach the Clerk JWT: `getToken()` from `useAuth()` → `Authorization: Bearer <token>`.

### Frontend Configuration

Create `cloudsharewebapp/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1.0
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_RAZORPAY_KEY=rzp_test_...
```

### Running the Frontend Locally

```powershell
cd cloudsharewebapp
npm install
npm run dev
```

---

## Deployment

| Component | Platform | Notes |
|---|---|---|
| Backend | [Render](https://render.com) | Deploy as Web Service using the `Dockerfile`; set all env vars in Render dashboard |
| Frontend | [Vercel](https://vercel.com) | Config in `vercel.json`; set `VITE_API_BASE_URL` to the Render service URL ending in `/api/v1.0` |

**Vercel build config** (`vercel.json`):
- Install: `npm --prefix cloudsharewebapp ci`
- Build: `npm --prefix cloudsharewebapp run build`
- Output: `cloudsharewebapp/dist`

**Clerk Webhook** — In the Clerk dashboard, add a webhook pointing to:
```
https://<your-render-url>/api/v1.0/webhooks/clerk
```
Subscribe to: `user.created`, `user.updated`, `user.deleted`.

**Razorpay** — Switch from test keys (`rzp_test_...`) to live keys in both Render and Vercel environment variables before going to production.
