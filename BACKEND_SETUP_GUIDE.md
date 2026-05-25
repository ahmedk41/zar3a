# Zar3a Backend Refactoring v2.0.0 - SETUP & DEPLOYMENT GUIDE

## Overview
This document covers all backend changes in v2.0.0, setup instructions, and deployment.

---

## WHAT'S NEW IN V2.0.0

### 1. Split Marketplace Logic ✅
- **Before**: Single Product table with `marketplaceType` field
- **After**: Same table but STRICT enforcement via roles:
  - FARMER → can ONLY add to CROP_MARKET
  - SUPPLIER → can ONLY add to AGRI_MARKET
  - API endpoints enforce this at route level

### 2. Role-Based Access Control ✅
- Farmers retrieve ONLY crop market orders
- Suppliers retrieve ONLY agri shop orders
- Admins see everything

### 3. Order & Payment System ✅
**New Flow:**
```
User creates order → PENDING
↓
Payment processing (Stripe) → PENDING
↓
Payment succeeds → PAID + PROCESSING
↓
Admin ships → SHIPPED
↓
Delivered → DELIVERED
```

**Old Flow (incorrect):**
- Orders created as COMPLETED immediately
- No payment validation

### 4. Expert Approval System ✅
- Expert MUST upload CV to get approved
- Only APPROVED experts can:
  - Create listings
  - Receive consultation messages
  - Appear in expert list

### 5. Payment Integration ✅
- Stripe integration ready
- Webhook handling for payment updates
- Payment intent creation & confirmation

### 6. Chat Persistence ✅
- Already in database, properly persisted
- Marking read status working
- Conversation history available

---

## INSTALLATION & SETUP

### Prerequisites
```bash
Node.js >= 16
MySQL/MariaDB 5.7+
npm or yarn
Stripe account (for payments)
```

### Step 1: Install Dependencies
```bash
cd zar3a-backend\ copy
npm install

# New dependencies (if needed):
npm install stripe@latest
```

### Step 2: Environment Variables
Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zar3a

# API
NODE_ENV=development
PORT=5002
CLIENT_URL=http://localhost:5173

# Auth
JWT_SECRET=your_jwt_secret_key_here_min_32_chars_please
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars

# Email (for password reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@zar3a.com

# Google OAuth (for registration)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Stripe (IMPORTANT!)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Upload
CV_UPLOAD_DIR=uploads/cv
MAX_FILE_SIZE=5242880 # 5MB in bytes
```

### Step 3: Database Setup
```bash
# Create database
mysql -u root -p
> CREATE DATABASE zar3a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;

# Run migrations (automatic on first start)
# Sequelize will sync schema from models
```

### Step 4: Start Backend
```bash
npm run dev
# or
npm start

# Expected output:
# ✅ Database connected & synced
# 🌱 Zar3a API is running (Refactored v2.0.0)
#     Local  →  http://localhost:5002
```

---

## FILE STRUCTURE

```
src/
├── controllers/
│   ├── auth.controller.js              (User registration, login, roles)
│   ├── marketplace.controller.js        ✅ NEW: Split marketplace logic
│   ├── orders.controller.js             ✅ UPDATED: Payment flow
│   ├── payment.controller.js            ✅ NEW: Stripe integration
│   ├── chat.controller.js               (Chat persistence)
│   ├── notification.controller.js
│   ├── admin.controller.js
│   └── tracking.controller.js
│
├── routes/
│   ├── auth.routes.js
│   ├── marketplace.routes.js            ✅ NEW: Split endpoints
│   ├── payment.routes.js                ✅ NEW: Payment endpoints
│   ├── orders.routes.js                 ✅ UPDATED: New endpoints
│   ├── chat.routes.js
│   ├── admin.routes.js
│   └── tracking.routes.js
│
├── models/
│   ├── Product.js                      (With marketplaceType enforced)
│   ├── Order.js                        (With PENDING/PROCESSING states)
│   ├── OrderItem.js
│   ├── ChatMessage.js
│   ├── User.js
│   ├── AgroExpertProfile.js            (With CV requirement)
│   └── ... (other models)
│
├── middlewares/
│   ├── authenticate.js                 (JWT verification)
│   ├── adminOnly.js                    (Admin check)
│   ├── roleBasedAccess.js
│   ├── upload.js                       (Multer CV upload) ✅ UPDATED
│   └── ...
│
├── utils/
│   ├── auth.js                         (Password hashing, JWT)
│   ├── mail.js                         (Email sending)
│   ├── otp.js
│   └── emailTemplates.js
│
└── server.js                           ✅ UPDATED: New routes
```

---

## NEW ENDPOINTS REFERENCE

### MARKETPLACE (SPLIT)

```
GET /marketplace/crop-products
  → Get all Crop Market products
  → No auth required
  → Returns: Product[]

POST /marketplace/crop-products
  → Create Crop Market product (FARMER ONLY)
  → Auth required, FARMER role enforced
  → Body: { title, description, category, price, ... }
  → Returns: Product

GET /marketplace/agri-products
  → Get all Agri Shop products
  → No auth required

POST /marketplace/agri-products
  → Create Agri Shop product (SUPPLIER ONLY)
  → Auth required, SUPPLIER role enforced
  → Body: { title, description, category, price, ... }
  → Returns: Product

GET /marketplace/search?q=tomato&marketplace=crop&category=PRODUCE
  → Search across products

GET /marketplace/products/:productId
  → Get single product details

GET /marketplace/expert-listings
  → Get all APPROVED expert listings

POST /marketplace/expert-listings
  → Create expert listing (APPROVED expert + CV required)
  → Returns: ExpertListing
```

### ORDERS (UPDATED)

```
POST /orders
  → Create single-product order
  → Auth required
  → Body: { productId, quantity, shippingAddress, paymentMethod }
  → Returns: { orderId, totalAmount, message }

POST /orders/checkout
  → Create order from cart (multiple items)
  → Auth required
  → Body: { items: [{productId, quantity, type}], shippingAddress, paymentMethod }
  → Returns: { orderId, totalAmount, message }

GET /orders
  → Get user's orders (filtered by role/marketplace automatically)
  → Auth required
  → Returns: Order[]

GET /orders/:orderId
  → Get order details
  → Auth required, user verification

PATCH /orders/:orderId/status
  → Update order status (ADMIN ONLY)
  → Auth + admin required
  → Body: { status: "PROCESSING|SHIPPED|DELIVERED|CANCELLED" }

GET /orders/admin/all
  → Get all orders (ADMIN ONLY)
  → Auth + admin required
```

### PAYMENTS (NEW - STRIPE)

```
POST /payments/intent
  → Create Stripe payment intent
  → Auth required
  → Body: { orderId }
  → Returns: { clientSecret, paymentIntentId, amount }

POST /payments/confirm
  → Confirm payment after Stripe success
  → Auth required
  → Body: { orderId, paymentIntentId }
  → Updates order to PAID + PROCESSING

GET /payments/:orderId/status
  → Check payment status
  → Auth required
  → Returns: { paymentStatus, orderStatus, totalAmount }

POST /payments/webhook
  → Stripe webhook (called by Stripe, not frontend)
  → No auth required
  → Stripe-signature header required
  → Updates order status based on payment result
```

---

## ROLE-BASED BEHAVIOR

### FARMER Role
```javascript
// Can do:
✓ Add products to CROP_MARKET only
✓ View orders from CROP_MARKET purchases
✓ Request expert consultation
✓ Complete farm profile

// Cannot do:
✗ Add to AGRI_MARKET
✗ See supplier orders
✗ Become expert (requires AGRO_EXPERT role)
```

### SUPPLIER Role
```javascript
// Can do:
✓ Add products to AGRI_MARKET only
✓ View orders from AGRI_MARKET purchases
✓ Request expert consultation
✓ Complete supplier profile

// Cannot do:
✗ Add to CROP_MARKET
✗ See farmer orders
✗ Become expert
```

### AGRO_EXPERT Role
```javascript
// Can do (if APPROVED + CV uploaded):
✓ Create expert listings
✓ Receive consultation messages
✓ Appear in expert listings
✓ Also can be a FARMER or SUPPLIER

// Cannot do:
✗ Perform expert actions until APPROVED
✗ Create listings without CV
✗ Appear in listings until APPROVED

// Approval Process:
1. User registers as EXPERT → pendingRole = AGRO_EXPERT
2. User completes profile + uploads CV
3. Admin approves → isApproved = true
4. Expert can now create listings
```

### ADMIN Role
```javascript
// Can do:
✓ Everything
✓ Approve experts
✓ View all orders/users
✓ Update order statuses
✓ Manage marketplace
```

---

## PAYMENT FLOW (STRIPE)

```
1. Frontend: User adds items to cart
   └─ Cart stored in localStorage

2. Frontend: User clicks "Checkout"
   └─ Calls POST /orders/checkout
   └─ Backend creates Order (status: PENDING, paymentStatus: PENDING)
   └─ Returns orderId

3. Frontend: Redirects to Payment page
   └─ Calls POST /payments/intent
   └─ Backend creates Stripe PaymentIntent
   └─ Returns clientSecret

4. Frontend: Stripe payment form
   └─ User enters card
   └─ Stripe confirms payment

5. Frontend: On success
   └─ Calls POST /payments/confirm
   └─ Backend verifies with Stripe
   └─ Updates Order (paymentStatus: PAID, status: PROCESSING)
   └─ Returns success

6. Webhook: Stripe sends payment updates (async)
   └─ POST /payments/webhook
   └─ Backend updates Order status based on event
   └─ payment_intent.succeeded → PAID
   └─ payment_intent.payment_failed → FAILED

Result:
- Order status: PENDING → PROCESSING → SHIPPED → DELIVERED
- User can track order in "Track Orders" page
```

---

## TESTING FLOWS

### Test 1: Farmer adds crop product
```bash
1. Login as FARMER
2. Go to Crop Market
3. Click "Add Product"
4. Fill form & submit
   ✓ Should create in CROP_MARKET
   ✗ Should NOT create if endpoint was /agri-products

Test endpoint:
curl -X POST http://localhost:5002/marketplace/crop-products \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Tomato","description":"Fresh","category":"PRODUCE","price":50}'
```

### Test 2: Supplier adds agri product
```bash
curl -X POST http://localhost:5002/marketplace/agri-products \
  -H "Authorization: Bearer SUPPLIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Seeds","description":"Quality","category":"SEEDS","price":100}'
```

### Test 3: Checkout and payment
```bash
1. User adds items to cart
2. Clicks "Checkout"
3. Backend creates order:
   {
     "orderId": 5,
     "totalAmount": 250.50,
     "paymentMethod": "STRIPE",
     "status": "PENDING",
     "paymentStatus": "PENDING"
   }
4. Frontend redirects to /payment/5
5. User enters Stripe test card: 4242 4242 4242 4242
6. On success: order updates to PROCESSING
```

### Test 4: Expert listing requires CV
```bash
1. Login as AGRO_EXPERT (but not approved, no CV)
2. Try to create expert listing
   ✗ Should fail: "CV upload required"

3. Upload CV in profile
4. Admin approves in panel
5. Try again
   ✓ Should succeed
```

---

## DEPLOYMENT CHECKLIST

- [ ] All environment variables set (.env)
- [ ] Database created and accessible
- [ ] Stripe account configured
- [ ] Webhook secret added to .env
- [ ] CV upload directory writable (uploads/cv/)
- [ ] Backend tests passing
- [ ] Frontend API calls updated
- [ ] Cors allowing frontend URL
- [ ] JWT secrets strong (32+ chars)
- [ ] Email sending configured (optional)
- [ ] Payment webhooks configured in Stripe dashboard

---

## TROUBLESHOOTING

### "Product role enforcement not working"
→ Check marketplace.controller.js has role validation
→ Verify user.role is populated (include in auth middleware)

### "Expert listings show unapproved experts"
→ Check getExpertListings filters by isApproved: true
→ Verify User association includes isApproved field

### "Orders not updating after payment"
→ Check Stripe webhook secret correct in .env
→ Verify webhook URL configured in Stripe dashboard
→ Check payment.controller.js stripeWebhook function

### "Cart showing wrong marketplace"
→ Verify cart items include `type` field ('crop' or 'agri')
→ Check orders.controller.js validates type matches product.marketplaceType

### "Expert CV upload not saving"
→ Check uploads/cv/ directory exists and writable
→ Verify upload.js middleware accepts both 'cv' and 'cv_file' field names
→ Check AgroExpertProfile has cvFilePath field

---

## PERFORMANCE TIPS

1. **Indexing**: Add indexes to frequently queried fields
   ```sql
   ALTER TABLE Products ADD INDEX idx_marketplace (marketplaceType);
   ALTER TABLE Products ADD INDEX idx_userId (userId);
   ALTER TABLE Orders ADD INDEX idx_userId (userId);
   ALTER TABLE OrderItems ADD INDEX idx_orderId (orderId);
   ```

2. **Pagination**: Implement for large result sets
   ```javascript
   GET /marketplace/crop-products?page=1&limit=20
   ```

3. **Caching**: Cache expert listings (rarely change)

4. **Database Connections**: Use connection pooling

---

## MONITORING & LOGGING

Add to production environment:
```javascript
// Log important events
console.log(`✅ Expert ${expert.id} approved`);
console.log(`💳 Order ${order.id} payment received`);
console.log(`⚠️ Payment failed for order ${order.id}: ${error}`);
```

---

## VERSION HISTORY

- **v1.0.0**: Initial release (single marketplace, no payment)
- **v2.0.0**: Full refactor (split marketplace, payment, strict roles)

---

## SUPPORT

For issues:
1. Check error message & logs
2. Review this guide's troubleshooting section
3. Check backend validation rules
4. Verify database schema matches models

---

## NEXT STEPS

1. ✅ Backend refactoring (DONE)
2. ⏳ Frontend refactoring (Use FRONTEND_REFACTORING_GUIDE.md)
3. ⏳ Testing all flows
4. ⏳ Stripe integration testing
5. ⏳ Production deployment
6. ⏳ Real-time chat with Socket.io (optional, future version)
