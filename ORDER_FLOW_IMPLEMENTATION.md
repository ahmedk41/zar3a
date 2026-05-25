# Order Flow Implementation Guide

## Overview
This document describes the complete order flow for the Zar3a marketplace system, including payment processing, order creation, and role-based visibility.

---

## 1. DATABASE SCHEMA

### Order Table
```
id (PK, INT)
userId (FK, INT) - Buyer who placed the order
status (ENUM: PENDING, COMPLETED, CANCELLED, FAILED)
paymentStatus (ENUM: NONE, PENDING, PAID, FAILED)
totalAmount (DECIMAL 12,2)
paymentMethod (STRING)
shippingAddress (TEXT)
createdAt, updatedAt (TIMESTAMPS)
```

### OrderItem Table
```
id (PK, INT)
orderId (FK, INT) - Links to Order
productId (FK, INT) - Links to Product
ownerId (FK, INT) - Links to User (the seller/owner)
title, description, category (STRING/TEXT)
price (DECIMAL 12,2)
quantity (INT)
totalPrice (DECIMAL 12,2)
imageUrl, unit, region (STRING)
marketplaceType (ENUM: CROP_MARKET, AGRI_MARKET)
productSource (ENUM: MANUAL, SENSED)
status (ENUM: AVAILABLE, SOLD, PENDING, etc.)
createdAt, updatedAt (TIMESTAMPS)
```

### Key Relationships
- **Order** → **User** (buyer via userId)
- **OrderItem** → **Order** (many items per order)
- **OrderItem** → **Product** (references product)
- **OrderItem** → **User** (seller via ownerId)

---

## 2. PAYMENT FLOW

### Step 1: Add to Cart (Frontend)
```javascript
// User adds products to cart
useCart hook manages:
- localStorage persistence per userId
- Backend sync via cartAPI.updateCart()
- Item structure: {productId, type, quantity, price, ownerId, ...}
```

### Step 2: Checkout Page (Frontend)
```javascript
// Payment.jsx calls:
const { checkout } = useAuth();
await checkout(
  cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    type: item.type  // 'crop' or 'agri'
  })),
  { shippingAddress: address }
);
```

### Step 3: Create Order (Backend: POST /orders/checkout)
```javascript
// 1. Validates cart items
// 2. Checks product existence and marketplace type match
// 3. Creates Order with paymentStatus = 'PENDING'
// 4. Creates OrderItems with:
//    - ownerId = product.userId (seller)
//    - marketplaceType = product.marketplaceType
// 5. Creates OrderTracking records
// Returns: { orderId, totalAmount, paymentMethod }
```

### Step 4: Payment Intent (Frontend → Stripe)
```javascript
// Stripe Payment Intent created with orderId in metadata
// User completes payment on Stripe
```

### Step 5: Payment Confirmation (Backend)
**Option A:** Stripe Webhook
```javascript
// POST /webhooks/stripe
// Listens to payment_intent.succeeded
// Updates order: paymentStatus = 'PAID', status = 'PROCESSING'
// Updates all OrderItems and OrderTracking
```

**Option B:** Client-side Confirmation
```javascript
// POST /payments/confirm
// Verifies payment with Stripe
// Updates order: paymentStatus = 'PAID', status = 'PROCESSING'
```

---

## 3. ORDER VISIBILITY (ROLE-BASED FILTERING)

### GET /orders (listUserOrders endpoint)

#### BUYER Role
```javascript
// Shows: All orders they placed (userId = their id)
// Includes: All items in orders
// No filtering needed - buyers see their own purchases
```

#### FARMER Role
```javascript
// Shows: Orders where:
//   - OrderItem.marketplaceType = 'CROP_MARKET'
//   - OrderItem.ownerId = farmer's userId
// Purpose: Farmers see items they sold to buyers
```

#### SUPPLIER Role
```javascript
// Shows: Orders where:
//   - OrderItem.marketplaceType = 'AGRI_MARKET'
//   - OrderItem.ownerId = supplier's userId
// Purpose: Suppliers see items they sold to buyers
```

#### ADMIN Role
```javascript
// Shows: ALL orders for ALL users
// No filtering applied
// Can see complete order history and audit trail
```

#### AGRO_EXPERT Role
```javascript
// NOT ALLOWED to see orders
// Should be redirected or shown access denied message
```

---

## 4. TRACK ORDERS (Role-Based Feed)

### Backend: GET /tracking/orders
Filters OrderTracking and Product records by role:

```javascript
// FARMER: Sees ONLY CROP_MARKET items with paymentStatus = 'PAID'
// SUPPLIER: Sees ONLY AGRI_MARKET items with paymentStatus = 'PAID'
// ADMIN: Sees ALL items
// AGRO_EXPERT: DENIED ACCESS
// BUYER: Sees all paid items (no role filtering)
```

### Frontend: TrackOrders Page
```javascript
// 1. Checks if user role = 'AGRO_EXPERT'
// 2. If yes: Shows access denied message
// 3. If no: Calls getOrderTracking() which already filters by role
// 4. Displays role-appropriate items
```

---

## 5. CART SYSTEM (Per-User)

### useCart Hook (Frontend)
```javascript
// Initialization:
// 1. Loads from localStorage (key: 'zar3a_cart_${userId}')
// 2. If user logged in, syncs with backend via cartAPI.getCart()
// 3. Updates localStorage on any change
// 4. Debounced backend sync (500ms)

// Item Structure:
{
  productId: number,
  type: 'crop' | 'agri',
  marketplaceType: 'CROP_MARKET' | 'AGRI_MARKET',
  quantity: number,
  price: number,
  title: string,
  imageUrl: string,
  ownerId: number (not shown but calculated from product)
}
```

### Backend: Cart Model
```javascript
// GET /cart - Returns user's cart from database
// PUT /cart - Updates cart items in database
// DELETE /cart - Clears cart
// Unique constraint: One cart per userId
```

---

## 6. SIDEBAR VISIBILITY

### Track Orders Menu Item
```javascript
// Shown to: BUYER, FARMER, SUPPLIER, ADMIN
// Hidden from: AGRO_EXPERT, Unregistered users
// Condition: user?.role && !['AGRO_EXPERT'].includes(user.role)
```

---

## 7. API ENDPOINTS SUMMARY

| Method | Endpoint | Description | Auth | Role Filter |
|--------|----------|-------------|------|-------------|
| POST | /orders | Create single product order | Yes | - |
| POST | /orders/checkout | Create order from cart | Yes | - |
| GET | /orders | Get user's orders | Yes | FARMER/SUPPLIER/ADMIN/BUYER |
| GET | /orders/:id | Get order details | Yes | - |
| PATCH | /orders/:id/status | Update order status | Yes | ADMIN only |
| GET | /orders/admin/all | List all orders | Yes | ADMIN only |
| POST | /cart | Create/initialize cart | Yes | - |
| GET | /cart | Get user's cart | Yes | - |
| PUT | /cart | Update cart items | Yes | - |
| DELETE | /cart | Clear cart | Yes | - |
| GET | /tracking/orders | Get tracking feed | Yes | Role-based |
| POST | /payments/intent | Create Stripe intent | Yes | - |
| POST | /payments/confirm | Confirm payment | Yes | - |
| POST | /webhooks/stripe | Stripe webhook | No | - |

---

## 8. PRODUCT STRUCTURE

### Requirements for Marketplace Items
```javascript
// Each product MUST have:
{
  id: number (PK),
  userId: number (owner/seller),
  title: string,
  price: decimal,
  marketplaceType: 'CROP_MARKET' | 'AGRI_MARKET',
  status: 'AVAILABLE' | 'SOLD' | 'DELETED',
  // ... other fields
}
```

### Product Type Mapping
- **CROP_MARKET** → type: 'crop' → owner: Farmer
- **AGRI_MARKET** → type: 'agri' → owner: Supplier

---

## 9. COMPLETE ORDER FLOW EXAMPLE

### Scenario: Buyer purchases from Farmer
```
1. Buyer adds 5 crops to cart
   Cart Item: {productId: 1, type: 'crop', quantity: 5, price: 100}
   
2. Buyer clicks "Pay"
   Payment.jsx calls: checkout([{productId: 1, quantity: 5, type: 'crop'}])
   
3. Backend creates Order
   Order: {userId: buyerId, paymentStatus: 'PENDING', totalAmount: 500}
   OrderItem: {orderId: 1, productId: 1, ownerId: farmerId, quantity: 5, 
              marketplaceType: 'CROP_MARKET', totalPrice: 500}
   
4. Stripe Payment
   User completes Stripe payment with orderId in metadata
   
5. Payment Confirmation
   Webhook updates: Order.paymentStatus = 'PAID', status = 'PROCESSING'
   
6. Buyer Views Orders
   GET /orders → Shows Order 1 with all items
   
7. Farmer Views Orders
   GET /orders → Shows OrderItem where ownerId = farmerId AND marketplaceType = 'CROP_MARKET'
   Sees the 5 items they sold
   
8. Admin Views Orders
   GET /orders/admin/all → Shows all orders and items
```

---

## 10. IMPORTANT NOTES

✅ **Filtering happens at backend level** - Frontend doesn't filter, backend does
✅ **PaymentStatus is critical** - Only PAID items should be shown
✅ **OwnerID is essential** - Determines who sees which items
✅ **MarketplaceType is essential** - Determines crop vs agri separation
✅ **Cart is per-user** - useCart(userId) creates unique localStorage keys
✅ **Access control in Sidebar** - AGRO_EXPERT excluded from Track Orders
✅ **Order persistence** - Orders created BEFORE payment, updated AFTER payment

---

## 11. TESTING CHECKLIST

- [ ] Buyer adds items to cart and checkout
- [ ] Payment creates order with correct paymentStatus
- [ ] Payment webhook updates order status
- [ ] Buyer can see their orders in GET /orders
- [ ] Farmer can see ONLY crop items they own
- [ ] Supplier can see ONLY agri items they own
- [ ] Admin can see all items
- [ ] AGRO_EXPERT gets access denied on TrackOrders
- [ ] Cart persists per user (different users have different carts)
- [ ] Products have ownerId correctly set
- [ ] OrderTracking filters by paymentStatus = 'PAID'

---

## 12. ENVIRONMENT VARIABLES REQUIRED

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=...
JWT_SECRET=...
```
