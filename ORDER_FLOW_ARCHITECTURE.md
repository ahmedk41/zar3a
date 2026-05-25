# Order Flow Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Zar3a - React)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌────────────────┐            │
│  │ Marketplace  │      │   Payment    │      │ TrackOrders    │            │
│  │   (Cart)     │─────▶│    Page      │─────▶│   Page         │            │
│  └──────────────┘      └──────────────┘      └────────────────┘            │
│       │                       │                       │                      │
│       │ useCart(userId)       │ checkout()            │ getOrderTracking()   │
│       │ (per-user isolation)  │                       │ (role-based)         │
│       │                       │                       │                      │
│  ┌────▼───────────────────────▼───────────────────────▼──────────────────┐  │
│  │              AuthContext / API Calls (axiosInstance)                  │  │
│  │  cartAPI.getCart/updateCart | checkout | getOrderTracking            │  │
│  └────┬───────────────────────┬───────────────────────┬──────────────────┘  │
│       │                       │                       │                      │
│       │ HTTP Request/Response │                       │                      │
│       │                       │                       │                      │
└───────┼───────────────────────┼───────────────────────┼──────────────────────┘
        │                       │                       │
        │                       │                       │
        │ PUT /cart            │ POST /checkout        │ GET /tracking/orders
        │                       │ POST /webhooks        │
┌───────▼───────────────────────▼───────────────────────▼──────────────────────┐
│                    BACKEND (Node.js/Express)                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐                │
│  │  Cart Routes    │  │ Orders Routes   │  │ Payment      │                │
│  │  /cart (*)      │  │ /orders (*)     │  │ Routes       │                │
│  │  GET/PUT/DELETE │  │ POST/GET/PATCH  │  │ /payments    │                │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘                │
│           │                    │                   │                        │
│           │ cart.controller    │ orders.controller │ payment.controller    │
│           │                    │                   │                        │
│  ┌────────▼────────────────────▼───────────────────▼──────────────────────┐ │
│  │                     BUSINESS LOGIC                                     │ │
│  │                                                                         │ │
│  │  ┌─ CHECKOUT FLOW ────────────────────────────────────────────────┐  │ │
│  │  │ 1. Validate cart items                                         │  │ │
│  │  │ 2. Check product existence & marketplace type match            │  │ │
│  │  │ 3. Create Order (paymentStatus: 'PENDING')                    │  │ │
│  │  │ 4. Create OrderItem WITH ownerId = product.userId            │  │ │
│  │  │ 5. Create OrderTracking record                                │  │ │
│  │  │ 6. Return orderId for payment processing                      │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─ PAYMENT CONFIRMATION ──────────────────────────────────────────┐  │ │
│  │  │ 1. Verify Stripe payment_intent.succeeded event                │  │ │
│  │  │ 2. Update Order: paymentStatus = 'PAID'                        │  │ │
│  │  │ 3. Update OrderTracking: paymentStatus = 'PAID'               │  │ │
│  │  │ 4. Set status = 'PROCESSING'                                  │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─ ROLE-BASED ORDER RETRIEVAL ────────────────────────────────────┐  │ │
│  │  │ GET /orders (listUserOrders)                                   │  │ │
│  │  │                                                                │  │ │
│  │  │ BUYER: WHERE userId = req.user.id                            │  │ │
│  │  │ FARMER: WHERE ownerId = req.user.id AND marketplaceType     │  │ │
│  │  │         = 'CROP_MARKET'                                      │  │ │
│  │  │ SUPPLIER: WHERE ownerId = req.user.id AND marketplaceType   │  │ │
│  │  │           = 'AGRI_MARKET'                                    │  │ │
│  │  │ ADMIN: No WHERE clause - sees ALL                            │  │ │
│  │  │ AGRO_EXPERT: DENIED                                          │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─ TRACK ORDERS (Role-Based Feed) ───────────────────────────────┐  │ │
│  │  │ GET /tracking/orders (tracking.controller)                    │  │ │
│  │  │                                                                │  │ │
│  │  │ Filters by:                                                  │  │ │
│  │  │ - paymentStatus = 'PAID' (only paid orders)                 │  │ │
│  │  │ - marketplaceType (CROP_MARKET or AGRI_MARKET)             │  │ │
│  │  │ - role-specific queries                                      │  │ │
│  │  │                                                                │  │ │
│  │  │ Result: Farmers see crops, Suppliers see agri, Admins see all│  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    DATABASE (Sequelize/SQL)                            │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ PRODUCTS Table                                                  │ │ │
│  │  │ ┌─────────────┐                                                │ │ │
│  │  │ │ id (PK)     │                                                │ │ │
│  │  │ │ userId ◄────┼─── Seller/Owner                              │ │ │
│  │  │ │ title       │                                                │ │ │
│  │  │ │ price       │                                                │ │ │
│  │  │ │ marketplaceType: 'CROP_MARKET' | 'AGRI_MARKET'             │ │ │
│  │  │ │ status: 'AVAILABLE'                                         │ │ │
│  │  │ └─────────────┘                                                │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                             │                                         │ │ │
│  │                    ┌────────▼────────┐                               │ │ │
│  │                    │ ORDERS Table    │                               │ │ │
│  │                    ├─────────────────┤                               │ │ │
│  │                    │ id (PK)         │                               │ │ │
│  │                    │ userId ─────────┼──► Buyer                     │ │ │
│  │                    │ totalAmount     │                               │ │ │
│  │                    │ paymentStatus   │                               │ │ │
│  │                    │ status          │                               │ │ │
│  │                    │ createdAt       │                               │ │ │
│  │                    └────────┬────────┘                               │ │ │
│  │                             │                                         │ │ │
│  │              ┌──────────────▼───────────────┐                        │ │ │
│  │              │ ORDER_ITEMS Table           │                        │ │ │
│  │              ├────────────────────────────┤                          │ │ │
│  │              │ id (PK)                     │                        │ │ │
│  │              │ orderId (FK) ───────────────┼──► Order              │ │ │
│  │              │ productId (FK) ─────────────┼──► Product            │ │ │
│  │              │ ownerId (FK) ───────────────┼──► Seller/Owner ◄──── │ │ │
│  │              │ quantity                    │    KEY FIELD          │ │ │
│  │              │ price, totalPrice           │    (Enables role-     │ │ │
│  │              │ marketplaceType             │     based filtering)  │ │ │
│  │              │ paymentStatus               │                        │ │ │
│  │              │ createdAt                   │                        │ │ │
│  │              └────────────────────────────┘                          │ │ │
│  │                                                                       │ │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │ │
│  │  │ ORDER_TRACKING Table (denormalized for fast queries)         │   │ │ │
│  │  │ - Mirrors order items data                                  │   │ │ │
│  │  │ - Indexed by: paymentStatus, marketplaceType, ownerId      │   │ │ │
│  │  │ - Used for fast tracking feed queries                       │   │ │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │ │
│  │                                                                       │ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘


## Data Flow: Complete Purchase Scenario

┌─────────────┐
│ Buyer Login │
└──────┬──────┘
       │
       ▼
┌────────────────────────┐
│ Add Items to Cart      │
│ useCart(userId)        │ ◄── Per-user localStorage key
│ Cart Item: {           │
│   productId,           │
│   type: 'crop',        │
│   quantity,            │
│   ownerId (from prod)  │
│ }                      │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Payment Page           │
│ Review order summary   │
│ Enter shipping address │
└──────┬─────────────────┘
       │ User clicks "Pay"
       ▼
┌────────────────────────────────────┐
│ POST /orders/checkout              │
│ Backend:                           │
│ 1. Validate cart items             │
│ 2. Create Order (PENDING)          │
│ 3. Create OrderItems               │
│    - Include: ownerId = product.id │
│ 4. Create OrderTracking            │
│ Returns: orderId, totalAmount      │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────┐
│ Stripe Payment Widget  │
│ User enters card info  │
│ Stripe validates       │
└──────┬─────────────────┘
       │ Payment succeeded
       ▼
┌────────────────────────────────────┐
│ POST /webhooks/stripe              │
│ Backend receives:                  │
│ - payment_intent.succeeded event   │
│ - metadata.orderId                 │
│                                    │
│ Updates:                           │
│ - Order.paymentStatus = 'PAID'    │
│ - Order.status = 'PROCESSING'     │
│ - OrderItem.paymentStatus = 'PAID'│
│ - OrderTracking.paymentStatus     │
│   = 'PAID'                         │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Frontend Updates                   │
│ - Clear cart                       │
│ - Show success message             │
│ - Redirect to /track-orders        │
└──────┬─────────────────────────────┘
       │
       ▼ (Different scenarios by role)
       │
   ┌───┴──────────┬─────────────┬──────────────┐
   │              │             │              │
   ▼ Farmer       ▼ Supplier    ▼ Buyer        ▼ Admin
   │             │             │              │
GET /orders     GET /orders   GET /orders   GET /orders/admin/all
   │             │             │              │
Sees items      Sees items    Sees all      Sees all
they own        they own      their orders  items
(CROP_MARKET,   (AGRI_MARKET, (all items    (no filter)
ownerId=their   ownerId=their they bought)
id)             id)


## Access Control Matrix

┌───────────────┬──────────┬────────────┬─────────────┬──────────┬─────────────┐
│ Resource      │ BUYER    │ FARMER     │ SUPPLIER    │ ADMIN    │ AGRO_EXPERT │
├───────────────┼──────────┼────────────┼─────────────┼──────────┼─────────────┤
│ /orders       │ Own only │ Own items  │ Own items   │ All      │ ❌ DENIED   │
│               │ (buyer)  │ (CROP)     │ (AGRI)      │          │             │
├───────────────┼──────────┼────────────┼─────────────┼──────────┼─────────────┤
│ /track-orders │ ✅ Yes   │ ✅ Yes     │ ✅ Yes      │ ✅ Yes   │ ❌ DENIED   │
│               │ (all)    │ (CROP)     │ (AGRI)      │ (all)    │ (401)       │
├───────────────┼──────────┼────────────┼─────────────┼──────────┼─────────────┤
│ /marketplace  │ ✅ Yes   │ ✅ Yes     │ ✅ Yes      │ ✅ Yes   │ ✅ Yes      │
│               │ (view)   │ (view/add) │ (view/add)  │ (all)    │ (view only) │
├───────────────┼──────────┼────────────┼─────────────┼──────────┼─────────────┤
│ /cart         │ ✅ Yes   │ ✅ Yes     │ ✅ Yes      │ ✅ Yes   │ ✅ Yes      │
│               │ (their)  │ (their)    │ (their)     │ (any)    │ (their)     │
├───────────────┼──────────┼────────────┼─────────────┼──────────┼─────────────┤
│ /consultations│ ❌ No    │ ❌ No      │ ❌ No       │ ❌ No    │ ✅ Yes      │
│               │          │            │             │          │ (their)     │
└───────────────┴──────────┴────────────┴─────────────┴──────────┴─────────────┘


## Key Design Patterns

1. **OwnerID Tracking**
   - Every OrderItem stores ownerId (product seller)
   - Enables efficient role-based filtering
   - No need for expensive joins in role checks

2. **Marketplace Type Separation**
   - Products marked as CROP_MARKET or AGRI_MARKET
   - OrderItems inherit this classification
   - Combined with ownerId for precise role filtering

3. **PaymentStatus as Gate**
   - Only PAID items shown in tracking/orders
   - Ensures buyers don't see unpaid items
   - Prevents premature fulfillment

4. **Per-User Cart Isolation**
   - localStorage keys include userId
   - Different users never see same cart
   - Frontend + backend sync ensures consistency

5. **Backend-Level Security**
   - All role-based filtering at query level
   - Frontend can't bypass restrictions
   - SQL queries use indexed fields for performance

6. **Denormalized OrderTracking**
   - Reduces query complexity
   - Improves performance for tracking feed
   - Indexed for common filter patterns
