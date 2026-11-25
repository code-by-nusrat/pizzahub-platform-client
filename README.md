# 🍕 PizzaHub — Online Pizza Ordering & Restaurant Management Platform

PizzaHub is a full-stack food ordering platform with three roles:

- **Customers** browse approved menu items, place orders with a delivery date and address, track order status and cancel pending orders.
- **Vendors** manage a restaurant profile and menu, upload dish photos, accept or reject customer orders and manage a subscription plan.
- **Admins** manage users, moderate menu items, and review platform transactions.

The frontend is a Next.js App Router application; the API is a separate Express + MongoDB service. Authentication is handled by **Better Auth**, and every private API call
is authorized on the server with a Bearer session token and a role check.


# Banner
<img width="3200" height="1040" alt="image" src="https://github.com/user-attachments/assets/6778c2b5-69f1-4eea-b469-ec0df0e264ce" />


## 🌐 Live Project

| | URL |
|---|---|
| **Live website (client)** | https://pizzahub-client-liart-gamma.vercel.app |
| **Live API (server)** | https://pizzahub-server-one-black.vercel.app |
| **Client repository** | https://github.com/code-by-nusrat/pizzahub-platform-client |
| **Server repository** | https://github.com/code-by-nusrat/pizzahub-server |

## ✨ Key Features

### Authentication & authorization
- Email + password sign-up/sign-in with Better Auth.
- Google OAuth sign-in.
- Role selection at sign-up (Customer or Vendor); admin accounts cannot be created from public registration.
- Password policy enforced **on the server** (minimum 6 characters, at least one uppercase and one lowercase letter).
- Protected dashboards with server-side role checks — changing the URL cannot open another role's dashboard.
- Blocked users are rejected on protected routes and API calls.
- Navbar updates immediately after sign-in/sign-out and shows a profile dropdown.

### Customer
- Public browse page with search by name, filters by category and location, loading/empty/error states.
- Item details at `/menu/[id]` (Sign In required), with price, category, description, kitchen and location.
- Cart with quantity controls, delivery date, delivery address and special instructions.
- Order placement with duplicate-order protection (one active order per dish per delivery date).
- Customer dashboard: overview statistics and charts, My Orders, cancel pending orders, profile settings.

### Vendor
- Vendor dashboard: overview statistics and charts, menu list, add/edit/delete items, availability toggle.
- Required image upload through **ImgBB** (the API key stays on the server).
- New items start as `pending` until an admin approves them.
- Free plan: up to 3 active items; Premium: unlimited.
- Customer orders with accept/reject actions (pending orders only, once only) and email notification.
- Subscription page with Stripe Checkout for Premium and payment history.

### Admin
- Admin dashboard with platform statistics and charts.
- Manage users: search, filter by role, block/unblock (admins cannot block themselves).
- Manage menu items: search, filter, approve (`approved`) or unpublish (`pending`), delete inappropriate items.
- Transactions: read-only payment records (no editing).

### Payments
- **Vendors only** use Stripe Checkout to upgrade to Premium.
- **Customer orders do not use Stripe.** The checkout page shows a plain payment method choice and the order is placed directly; the restaurant confirms it.
- Premium is activated only after the backend retrieves the Checkout Session from Stripe and confirms `status === "complete"` and `payment_status === "paid"`; the payment must also belong to the signed-in vendor.
- Stripe secret keys are used only on the server.

### UI/UX
- Warm pizza palette (cream, tomato red, basil green), consistent headings, equal-height cards and grid layouts.
- Fully responsive on mobile, tablet and desktop.
- Framer Motion / Motion animations on homepage sections, with reduced-motion support.
- Light/dark theme toggle (half-moon icon); dark mode uses a black navbar.
- Toast notifications for success and error messages — no `alert()`.
- Custom 404, loading skeletons, unauthorized and blocked pages.

## 🧰 Tech Stack

### Client (`pizzahub-client`)
| Purpose | Packages |
|---|---|
| Framework | `next` (App Router), `react`, `react-dom`, `typescript` |
| Styling | `tailwindcss`, `tw-animate-css`, `shadcn`, `class-variance-authority`, `cn` |
| UI primitives | Radix/Base UI packages, `lucide-react`, `cmdk`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`, `input-otp` |
| Animation | `motion` (Framer Motion) |
| Charts | `recharts` |
| Authentication | `better-auth`, `@better-auth/mongo-adapter` |
| Database | `mongodb` |
| Payments | `@stripe/stripe-js`, `stripe` |
| Notifications | `react-toastify` |
| Utilities | `date-fns`, `shiki` |

### Server (`pizzahub-server`)
| Purpose | Packages |
|---|---|
| Runtime | Node.js, `express` |
| Database | `mongodb` |
| Payments | `stripe` |
| Uploads | `multer` |
| Config | `dotenv`, `cors` |

## 🏗️ Architecture

```text
Browser (Next.js App Router)
   │  Better Auth session cookie + Bearer session token
   ▼
Next.js server components / API routes
   │  Authorization: Bearer <session token>
   ▼
Express API (verifyToken → requireRole → handler)
   │
   ├── MongoDB (users, menu, orders, transactions, profiles)
   ├── Stripe (vendor subscriptions)
   ├── ImgBB (dish images)
   └── Resend (order status emails, optional)
```

- Better Auth owns the auth collections and issues the session token.
- The Next.js `/api/imgbb` route forwards uploads to ImgBB so the ImgBB key never reaches the browser.
- The backend derives the user and role from the verified token; it never trusts IDs or roles sent by the client.
- Unauthorized requests return `401`; forbidden role requests return `403`.

## 🗄️ Database Collections

Better Auth manages `user`, `session`, `account` and `verification`.

Business collections:

| Collection | Contents |
|---|---|
| `menuData` | `vendorId`, `name`, `category`, `description`, `price`, `location`, `image`, `businessName`, `approvalStatus`, `isAvailable` |
| `orders` | `itemId`, `vendorId`, `customerId`, `deliveryDate`, `deliveryAddress`, `message`, `status` |
| `transactions` | `vendorId`, `plan`, `amount`, `currency`, `sessionId`, `status` |
| `vendorProfile` | Vendor business details |
| `customerProfile` | Customer contact details |

## ⚙️ Installation & Local Setup

### 1. Clone both repositories

```bash
git clone https://github.com/code-by-nusrat/pizzahub-platform-client.git
git clone https://github.com/code-by-nusrat/pizzahub-server.git
```

### 2. Install dependencies

```bash
cd pizzahub-platform-client
npm install

cd ../pizzahub-server
npm install
```

### 3. Environment variables

Create `.env` in the client (see `.env.example`) and in the server. Never commit real secrets.

**Client**

```env
# Better Auth
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_DB_URI=your_mongodb_connection_string

# Express API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ImgBB (used only by the server-side /api/imgbb route)
IMGBB_API_KEY=your_imgbb_api_key

# Stripe (vendor subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Optional: order status emails
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=PizzaHub <onboarding@resend.dev>
```

**Server**

```env
PORT=5000
DB_USER=your_mongodb_user
DB_PASSWORD=your_mongodb_password
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
# Optional: verify Better Auth JWTs instead of session tokens
# JWKS_URL=http://localhost:3000/api/auth/jwks
```

### 4. Run locally

Terminal 1 — API:

```bash
cd pizzahub-server
npm run dev        # http://localhost:5000
```

Terminal 2 — client:

```bash
cd pizzahub-platform-client
npm run dev        # http://localhost:3000
```

Other client scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint
```

## 🔐 API Protection Summary

| Endpoint | Access |
|---|---|
| `GET /browse-menu`, `GET /browse-menu/:id` | Public (approved + available items only) |
| `POST /orders`, `GET /orders`, `PATCH /orders/:id/cancel` | Customer only |
| `GET /vendor/orders`, `PATCH /vendor/orders/:id` | Vendor only, own orders |
| `GET /menu` | Vendor (own items) / Admin |
| `POST /menu`, `PUT /menu/:id`, `DELETE /menu/:id` | Vendor (own items) / Admin |
| `PATCH /menu/:id/moderation` | Admin only (`approved` or `pending`) |
| `GET /admin/stats`, user management | Admin only |
| `GET /transactions` | Admin / Vendor (own records) |
| `GET /subscription/:email` | Vendor (own plan) / Admin |
| `POST /payments/checkout-verify` | Vendor only, own payment |

## 📧 Order Emails (optional)

When a vendor accepts or rejects an order, the Next.js server action can email the customer through the Resend HTTP API. If `RESEND_API_KEY` is not set, the email step is skipped without changing the order result. A verified Resend domain is required to deliver to arbitrary addresses; the default `onboarding@resend.dev` sender only reaches the Resend account owner.

## 🚀 Deployment Notes

1. Deploy the Express API and set `DB_USER`, `DB_PASSWORD`, `STRIPE_SECRET_KEY`, `CLIENT_URL` (comma-separated allowed origins) and `PORT`.
2. Deploy the Next.js client and set all client variables from `.env.example`.
3. Add the production client URL to `BETTER_AUTH_URL`, Better Auth `trustedOrigins`, Google OAuth redirect URIs and Stripe success/cancel URLs.
4. Verify that reloading any private route keeps the user signed in (session cookie + server-side session read).

## 👩‍💻 Developer

Built as a full-stack web development project to demonstrate modern frontend development, REST API design, authentication and authorization, MongoDB data modelling and Stripe subscription billing.

**PizzaHub — Fresh Pizza, Happy Moments! 🍕**
