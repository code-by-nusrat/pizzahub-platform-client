# 🍕 PizzaHub – Online Pizza Ordering & Restaurant Management Platform

PizzaHub is a full-stack food ordering platform where customers can explore restaurants, browse delicious pizza menus, place orders, and make secure online payments. Vendors can manage their restaurants, menu items, and customer orders, while administrators can manage platform activities and maintain control over users and content.

The platform provides role-based dashboards for **Customers, Vendors, and Admins**, with secure authentication, protected APIs, and an integrated payment system.

## 🌐 Live Demo

- **Live Website:** [Add your deployed frontend URL]
- **Backend API:** [Add your deployed backend URL]

## ✨ Key Features

### 👤 Authentication & Authorization
- Secure email and password authentication using Better Auth.
- Google OAuth integration.
- MongoDB adapter for authentication data.
- Role-based access control for Customers, Vendors, and Admins.
- JWT/session-token verification for protected Express API routes.
- Blocked-user access prevention.
- Protected dashboards and role-specific functionality.

### 🛒 Customer Features
- Browse approved and available menu items.
- Explore food items and view detailed information.
- Search and filter menu items.
- Add items to the cart and place orders.
- Complete secure payments through Stripe Checkout.
- View order information and track order status.
- Manage personal profile information.

### 🏪 Vendor Features
- Vendor dashboard with business overview and statistics.
- Manage restaurant/business profile.
- Add, update, and delete menu items.
- Upload menu item images using ImgBB.
- Submit menu items for admin approval.
- Manage item availability.
- View and manage customer orders.
- Monitor subscription plans and active menu item limits.

### 🛡️ Admin Features
- Admin dashboard for platform management.
- Manage users and their roles.
- Manage menu item approval requests.
- Approve or reject submitted menu items.
- Monitor platform orders and activities.
- Restrict blocked users from accessing protected resources.

### 💳 Payment Integration
- Stripe Checkout for secure online payments.
- Backend-generated checkout sessions.
- Stripe webhook integration for payment event handling.
- Server-side payment verification to prevent unauthorized order updates.

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js App Router, React, TypeScript, JavaScript |
| Styling | Tailwind CSS, ShadCN UI |
| Animation | Framer Motion / Motion |
| Authentication | Better Auth, Google OAuth |
| Database | MongoDB |
| Backend | Express.js, Node.js |
| Authorization | JWT / Better Auth session tokens, Role-Based Access Control |
| Payment | Stripe Checkout, Stripe Webhooks |
| Image Hosting | ImgBB |
| Notifications | React Toastify |
| Icons | Lucide React |
| Deployment | Vercel / Backend Hosting |

## 🔐 Authentication & Middleware Flow

PizzaHub uses Better Auth for user authentication and an Express middleware system to protect backend resources.

### Authentication Process

1. Users register or sign in using email/password or Google OAuth.
2. Better Auth validates the user's credentials.
3. The authenticated session is stored using the MongoDB adapter.
4. The frontend retrieves the session token.
5. Protected API requests send the token through the Authorization header.

```http
Authorization: Bearer YOUR_SESSION_TOKEN
```

### Middleware Implementation

The backend uses two main middleware functions:

**1. `verifyToken`**

- Checks whether the Authorization header exists.
- Validates the Bearer token.
- Verifies the token against the Better Auth session or configured JWT verification mechanism.
- Retrieves the authenticated user from MongoDB.
- Rejects invalid, expired, or blocked-user sessions.
- Attaches authenticated user information to `req.user`.

**2. `requireRole(...roles)`**

- Checks the authenticated user's role.
- Allows access only when the user's role matches one of the permitted roles.
- Returns a forbidden response when the role is not authorized.

### Middleware Execution Order

```js
app.post(
  "/menu",
  verifyToken,
  requireRole("vendor"),
  addMenuItem
)
```

The request follows this flow:

```text
Client Request
     |
     v
Authorization Header
     |
     v
verifyToken
     |
     v
Validate Session Token
     |
     v
Check User Status
     |
     v
Attach User to req.user
     |
     v
requireRole("vendor")
     |
     v
Execute Protected Controller
     |
     v
Send Response
```

### Role-Based Access Examples

| Resource | Customer | Vendor | Admin |
|---|---|---|---|
| Browse approved menu | ✅ | ✅ | ✅ |
| Place orders | ✅ | ❌ | ❌ |
| Manage own menu | ❌ | ✅ | ❌ |
| Manage customer orders | ❌ | ✅ | ❌ |
| Approve menu items | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

*Access is enforced by backend middleware, not just frontend dashboard visibility.*

## 🔎 API Query Parameters & Implementation

PizzaHub uses query parameters to filter and retrieve relevant data from the backend without creating separate endpoints for every filter combination.

### Menu API

**Endpoint:**

```http
GET /menu?approvalStatus=all&businessName=Pizza House
```

Implementation:
- `approvalStatus` controls which approval statuses are returned.
- `businessName` filters menu items by restaurant.
- Vendor requests are authenticated and restricted to the vendor's own menu items.
- Admin requests can access menu records according to their permissions.

Example:

```js
app.get(
  "/menu",
  verifyToken,
  requireRole("vendor", "admin"),
  async (req, res) => {
    const { approvalStatus, businessName } = req.query

    const query = {}

    if (approvalStatus !== "all") {
      query.approvalStatus = approvalStatus || "approved"
    }

    if (req.user.role === "vendor") {
      query.vendorEmail = req.user.email
    }

    if (businessName) {
      query.businessName = businessName
    }

    const items = await menuCollection.find(query).toArray()

    res.send(items)
  }
)
```

*The example illustrates the filtering approach; the actual backend should retain its existing ownership and role checks.*

### Public Menu API

```http
GET /browse-menu?approvalStatus=approved
```

- Publicly accessible without authentication.
- Returns approved menu items.
- Used by customers to explore available food items.

### Subscription API

```http
GET /subscription/:email
```

- Retrieves subscription information.
- Provides premium status and active menu item limits.
- Used to determine whether vendors can publish additional menu items.

### Order API

```http
GET /vendor/orders
```

- Requires authentication.
- Vendor identity is determined from the verified session.
- Returns orders associated with the authenticated vendor.

## 💳 Stripe Payment Workflow

PizzaHub integrates Stripe Checkout for secure online payments.

1. Customer initiates checkout.
2. Frontend sends the order/payment request to the backend.
3. Backend validates the request and creates a Stripe Checkout Session.
4. Customer is redirected to Stripe's secure checkout page.
5. Stripe processes the payment.
6. Stripe sends a webhook event to the backend.
7. Backend verifies the webhook signature.
8. The payment/order status is updated based on the verified event.

**Security:** Payment status should be updated from verified Stripe webhook events rather than trusting frontend success redirects.

## 🖼️ Image Upload – ImgBB

ImgBB is used to host menu item images.

Implementation:
1. Vendor selects an image.
2. Frontend sends the image using `FormData`.
3. Backend or upload API processes the image.
4. ImgBB returns a hosted image URL.
5. The image URL is saved with the menu item in MongoDB.

## 🗄️ Database Collections

PizzaHub uses MongoDB to store application and authentication data.

Main collections include:

- `user` – User account information and roles.
- `session` – Authentication session records.
- `menu` – Restaurant menu items and approval information.
- `customerProfile` – Customer profile information.
- `vendorProfile` – Vendor business information.
- `orders` – Customer orders and payment information.
- `subscriptions` – Vendor subscription information.

*Collection names should be adjusted if your actual MongoDB database uses different names.*

## ⚙️ Installation & Setup

### 1. Clone the repositories

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
git clone YOUR_BACKEND_REPOSITORY_URL
```

### 2. Install dependencies

Frontend:

```bash
cd pizzahub-client
npm install
```

Backend:

```bash
cd pizzahub-server
npm install
```

### 3. Configure environment variables

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
BETTER_AUTH_URL=http://localhost:3000
```

Backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

IMGBB_API_KEY=your_imgbb_api_key

CLIENT_URL=http://localhost:3000
```

Add any additional Better Auth secrets and Google OAuth credentials required by your authentication configuration. Never commit real secrets to GitHub.

### 4. Run the application

Start the backend:

```bash
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

## 🚀 Future Improvements

- Real-time order status notifications.
- Advanced restaurant search and location-based filtering.
- Customer reviews and ratings.
- Discount coupons and promotional offers.
- Improved analytics for vendors and administrators.
- Enhanced mobile shopping experience.

## 👩‍💻 Developer

Developed as a full-stack web development project to demonstrate modern frontend development, backend API design, authentication, authorization, database management, and payment integration.

**PizzaHub – Fresh Pizza, Happy Moments! 🍕**