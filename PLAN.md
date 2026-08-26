# RetailFlow — Final Deliverable Development Plan

**Group:** S26PROJECTC4B89 · **Supervisor:** Irshad Nasir · **Author:** BC250226172
**Plan date:** 26 Aug 2026 · **Final submission:** 27 Oct 2026

---

## 1. Where we are

### 1.1 Submitted (prototype, 26 Aug 2026)
- **Task 1 — Auth:** Firebase email/password + Google sign-in (`src/app/login.tsx`)
- **Task 2 — Browsing:** Product grid from Firestore with search + category filters (`src/app/index.tsx`)
- **Task 3 — Design:** Dark gradient theme (#0F2027 / #00d2ff), styled cards, loading/empty states
- Expo SDK 51 · TypeScript · expo-router (file-based) · `seed.js` seeds 6 products

### 1.2 Missing for the final deliverable (SRS FR3–FR13)
| Requirement | Feature | Status |
|---|---|---|
| FR3/FR4 | Product details screen | Missing (list only) |
| FR5 | Add to Cart | Missing |
| FR6 | Manage Cart | Missing |
| FR7 | Checkout + payment (JazzCash/Easypaisa) | Missing |
| FR8 | Order history | Missing |
| FR9 | Admin login (role-based) | Missing |
| FR10/FR11 | Admin product add/update/delete | Missing |
| FR12/FR13 | Admin view all orders + update status | Missing |
| NFR2 | JWT auth + bcrypt on a backend | Missing (Firebase today) |

### 1.3 Key decisions (confirmed)
1. **Build the Express.js + MongoDB backend** per the Design Document (JWT + bcrypt). The app is rewired away from Firebase. Firestore/Firebase remains only as the archived prototype milestone (git history).
2. **Real JazzCash + Easypaisa sandbox integration** for checkout (merchant/sandbox credentials to be obtained; fallback documented in §9).
3. **Backend is a SEPARATE sibling project** (own folder + own git repo), **deployed on Vercel** as serverless functions. Database = **MongoDB Atlas** (free M0 cluster) — satisfies "Online DBMS".

### 1.4 Two sibling repos

```
D:\
├── RetailFlow\            # THIS repo — React Native (Expo) mobile app
└── retailflow-api\        # NEW sibling repo — Express.js backend (deploys to Vercel)
```

---

## 2. Target architecture

```
┌────────────────────┐      HTTPS/JSON (JWT)       ┌───────────────────────────┐
│  React Native app  │ ──────────────────────────► │  retailflow-api (Vercel)  │
│  (Expo, iOS+Android)│                            │  Express.js serverless     │
│  - auth screens    │ ◄────────────────────────── │  - JWT middleware         │
│  - product screens │        JSON responses       │  - bcrypt hashing         │
│  - cart / checkout │                             │  - MVC controllers        │
│  - orders          │                             │  - api/index.js entry     │
│  - admin panel     │                             └───────────┬───────────────┘
└────────────────────┘                                         │ Mongoose ODM
                                      ┌────────────────────────▼───────────────┐
                                      │  MongoDB Atlas (free M0)               │
                                      │  users / products / carts / orders     │
                                      │  (indexed fields)                      │
┌────────────────────┐                └────────────────────────────────────────┘
│ JazzCash sandbox   │ ◄── HTTP POST (hash) ────┐
│ Easypaisa sandbox  │ ── callback/status ────► │  (return URLs are public on Vercel)
└────────────────────┘                          │
```

Auth moves from Firebase to the API: register/login endpoints hash passwords (bcrypt) and return a JWT; admin users get an `admin` role checked by middleware. All API endpoints require the JWT (`Authorization: Bearer <token>`), stored in AsyncStorage.

### 2.1 Vercel deployment model

- **Single serverless entry:** the whole Express app lives in `api/index.js` (Vercel auto-detects it); `vercel.json` rewrites every path (`/api/:path*`) to that one function. Simple, and the Express MVC code stays exactly as designed.
- **MongoDB connection is cached** across invocations (global lazy singleton) so cold starts stay fast.
- **Environment variables** (`MONGODB_URI`, `JWT_SECRET`, payment credentials) are set in the Vercel project dashboard / `.env.production` — never committed.
- Free tier limits are fine for this workload; demo traffic stays well under limits.
- Local dev: `npm run dev` runs the same Express app on `localhost:4000`; the app points at either URL via `EXPO_PUBLIC_API_URL`.

### 2.2 Sibling repo contents

```
retailflow-api\               # NEW sibling repo (own .git) → deploys to Vercel
├── api/
│   └── index.js              # Vercel serverless entry — mounts the Express app
├── src/
│   ├── index.js              # shared app factory (also used for local dev)
│   ├── config/db.js          # cached Mongoose connection
│   ├── models/User.js, Product.js, Cart.js, Order.js
│   ├── controllers/…         # auth, product, cart, order, admin
│   ├── middlewares/…         # auth, admin, errorHandler, validate
│   ├── routes/…              # auth, products, cart, orders, admin
│   ├── services/paymentService.js   # JazzCash + Easypaisa sandbox
│   └── seed/seed.js          # seeds products + admin into MongoDB Atlas
├── tests/                    # Jest + Supertest
├── vercel.json               # rewrites → api/index.js
├── .env.example
└── package.json
```

---

## 3. Repository structure

### 3.1 This repo — `RetailFlow\` (React Native app only)

```
RetailFlow/
├── src/                        # React Native (Expo) app
│   ├── app/                    # expo-router routes
│   │   ├── _layout.tsx         # AuthProvider + navigation stack
│   │   ├── (auth)/login.tsx    # rewire to POST /api/auth/login|register
│   │   ├── (tabs)/
│   │   │   ├── index.tsx       # product catalog (rewire to API)
│   │   │   ├── cart.tsx        # NEW — manage cart
│   │   │   ├── orders.tsx      # NEW — order history
│   │   │   └── profile.tsx     # NEW — account + logout
│   │   ├── product/[id].tsx    # NEW — product details (FR4)
│   │   ├── checkout.tsx        # NEW — address + payment method (FR7)
│   │   ├── order-confirmation.tsx
│   │   └── admin/              # NEW — admin login, product mgmt, order mgmt
│   ├── api/                    # NEW — HTTP client + typed API modules
│   │   ├── client.ts           # fetch wrapper, base URL from EXPO_PUBLIC_API_URL, JWT injection
│   │   ├── auth.ts / products.ts / cart.ts / orders.ts / admin.ts
│   ├── context/                # NEW — auth-context.tsx, cart-context.tsx
│   ├── config/firebase.ts      # removed in final build (prototype legacy)
│   └── .env                    # EXPO_PUBLIC_API_URL=http://localhost:4000 (dev) / Vercel URL
├── PLAN.md
└── README.md                   # final: setup, env vars, how to run
```

### 3.2 Sibling repo — `retailflow-api\` (deploys to Vercel)

See §2.2. All backend code lives there; nothing server-side stays in this repo.

---

## 4. Database design (MongoDB, per Design Document §6)

| Collection | Key fields | Indexes |
|---|---|---|
| **users** | `_id`, `name`, `email` (unique), `passwordHash`, `role` ("user"/"admin"), `createdAt` | `email` unique |
| **products** | `_id`, `name`, `description`, `price`, `image`, `stock`, `category`, `createdAt` | `category`, `name` |
| **carts** | `_id`, `userId`, `items: [{productId, quantity}]`, `updatedAt` | `userId` |
| **orders** | `_id`, `userId`, `items: [{productId, quantity, priceAtPurchase}]`, `shippingAddress`, `paymentMethod`, `status` (Pending/Processing/Shipped/Delivered/Cancelled), `totalAmount`, `createdAt` | `userId`, `status` |

- Cart items and order items are embedded sub-documents (per design doc).
- Orders snapshot `priceAtPurchase` so later price changes don't alter history.

---

## 5. API contract (all responses JSON; auth endpoints public, rest JWT-protected)

| Method | Endpoint | Body / Params | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{name, email, password}` | user + JWT (409 if email exists) |
| POST | `/api/auth/login` | `{email, password}` | user + JWT (401 invalid) |
| GET | `/api/products` | — | product list |
| GET | `/api/products/:id` | — | product detail (404 not found) |
| GET | `/api/cart` | — | current cart |
| POST | `/api/cart/items` | `{productId, quantity}` | cart (409 out of stock) |
| PATCH | `/api/cart/items/:productId` | `{quantity}` | updated cart |
| DELETE | `/api/cart/items/:productId` | — | updated cart |
| POST | `/api/orders` | `{shippingAddress, paymentMethod}` | order (creates + clears cart) |
| GET | `/api/orders` | — | user's orders, newest first |
| GET | `/api/orders/:id` | — | order detail |
| POST | `/api/admin/auth/login` | `{email, password}` | admin-scoped JWT (role="admin") |
| POST | `/api/admin/products` | product fields | created product |
| PUT | `/api/admin/products/:id` | product fields | updated product |
| DELETE | `/api/admin/products/:id` | — | 204 |
| GET | `/api/admin/orders` | — | all orders |
| PATCH | `/api/admin/orders/:id/status` | `{status}` | updated order |

Validation on both client and server (express-validator); bcrypt for passwords; JWT on every protected route (NFR2).

---

## 6. Mobile screens to build / rewire

1. **Login/Register** (rewire) — replace Firebase calls with API; store JWT in AsyncStorage; role-aware redirect (user → tabs, admin → admin dashboard).
2. **Product catalog** (rewire) — keep grid/search/categories, fetch from `/api/products`.
3. **Product detail** (new, FR4) — image, price, description, stock, quantity picker, Add to Cart (disabled when out of stock).
4. **Cart** (new, FR6) — items list, quantity +/- , remove, live total, Checkout button, empty state.
5. **Checkout** (new, FR7) — shipping address input, payment method picker (JazzCash/Easypaisa), order summary, Place Order.
6. **Order confirmation + history** (new, FR8) — confirmation with order ID; history list with status, date, items; empty state.
7. **Admin login** (new, FR9) — separate admin entry; "Access denied" on non-admin.
8. **Admin — product management** (new, FR10/FR11) — list, add/edit form (name, price, description, image URL, category, stock), delete with confirm.
9. **Admin — order management** (new, FR12/FR13) — all orders, customer info, status dropdown (5 stages), immediate reflection.

Navigation: convert manual Login/Home switch in `_layout.tsx` to real expo-router stacks: `(auth)` stack, `(tabs)` for user, `admin` stack.

---

## 7. Payment sandbox integration

### 7.1 JazzCash
- Sign up at JazzCash Sandbox (developer.jazzcash.com.pk) → Merchant ID + Integrity Salt + MDU.
- Checkout builds a `pp_` POST (version, txn ref, amount, merchant id, return URL, signature = SHA-256 hash with Integrity Salt), sends via HTTP; parse response, confirm order status.

### 7.2 Easypaisa
- Easypaisa Developer/Test Portal → client ID/secret, test merchant creds.
- Token-based API: get access token → initiate payment → poll/verify status → mark order.

### 7.3 Handling
- Order is created with status **Pending** before/at gateway call; on gateway failure/timeout → order marked **"Payment Failed"** and user notified (matches TC-11/TC-12).
- Credentials live in `retailflow-api/.env` (never committed). `.env.example` documents required vars; they are mirrored to the Vercel dashboard for production.
- **Risk:** sandbox account approval can lag. Fallback in §9 keeps the deadline safe.

---

## 8. Testing plan (SRS TC-01 … TC-20)

- **Backend:** Jest + Supertest — auth (register/login/invalid/duplicate), products CRUD, cart ops, order creation (success + failed payment), admin status update.
- **Mobile:** manual execution of TC-01..TC-20 against the running API; record actual result into the Design Document test-case table (Status: Pass/Fail).
- **Non-functional spot checks:** catalog load < 3 s (NFR1), JWT enforcement on all routes (NFR2), empty/error states (NFR4), error boundaries (NFR5).

---

## 9. Milestones & timeline (final deadline 27 Oct 2026)

| # | Sprint | Dates | Deliverables |
|---|---|---|---|
| 1 | **Backend foundation** | 27 Aug – 5 Sep | ~~`retailflow-api` repo created; MongoDB Atlas + Express scaffold; User/Product models; JWT+bcrypt auth; products list/detail API; seed script; Jest setup~~ **DONE (26 Aug): full MVC backend scaffolded in `D:\retailflow-api`** — auth/register/login, products CRUD, cart, orders, admin, payment service (mock/JazzCash/Easypaisa), 21 tests, lint clean, committed. Remaining: MongoDB Atlas URI + seed + run tests + deploy to Vercel |
| 2 | **Mobile rewire + details** | 6 – 16 Sep | API client + auth/cart contexts; expo-router stacks; login/register/catalog rewired; product detail screen |
| 3 | **Cart + checkout + payment** | 17 – 27 Sep | Cart API + screens; order API; JazzCash & Easypaisa sandbox integration; confirmation screen; order history |
| 4 | **Admin panel** | 28 Sep – 8 Oct | Admin login (role JWT); product CRUD; order list + status updates |
| 5 | **Integration, tests, bug fixes** | 9 – 19 Oct | Execute TC-01..TC-20; fix bugs; edge cases (out-of-stock, empty cart, payment fail, network); NFR checks |
| 6 | **QA, docs & submission** | 20 – 27 Oct | Final testing & QA; update Design Document + write Final Report; zip all code + DB export + README; submit on VULMS |

**Risks & mitigations**
1. **Payment sandbox approval delay** → while waiting, build a gateway-shaped mock in `paymentService.js`; swap in real calls once credentials arrive. Design the service so the switch is one config flag.
2. **API unreachable for the demo** → the API is on Vercel (public HTTPS URL) by design; local dev uses `localhost:4000` via `EXPO_PUBLIC_API_URL`. Fallback if Vercel setup stalls: run locally + `expo start --tunnel`.
3. **Vercel serverless pitfalls** → connection caching for MongoDB, no local file writes (image URLs only), stateless functions, env vars set in the dashboard.
4. **Scope creep** → each sprint ends with a demoable feature set; no new features after Sprint 5.
5. **Data loss / corruption** → keep `seed.js` rerunnable; MongoDB Atlas gives daily backups on free tier; export collections (`mongodump`/Atlas export) for the submission zip.

---

## 10. Definition of Done (final deliverable)

- [ ] All 13 FRs implemented and demoable on Android (and web/emulator).
- [ ] TC-01..TC-20 executed, status recorded (Pass/Fail) in the Design Document.
- [ ] Backend unit tests pass (`npm test` in `retailflow-api/`).
- [ ] `npm run lint` clean in both app and `retailflow-api`.
- [ ] API live on Vercel (public HTTPS URL used by the app via `EXPO_PUBLIC_API_URL`).
- [ ] Design Document and SRS consistent with the implemented system (Express/MongoDB wording, updated mock-ups where needed).
- [ ] Submission zip: all code files + database export + README setup instructions.
