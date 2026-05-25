# Zar3a v2.0.0 - COMPLETE API REFERENCE

**Last Updated**: 2024  
**Backend Version**: v2.0.0  
**Status**: All endpoints tested and ready

---

## TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Marketplace (Split)](#marketplace-split)
3. [Orders & Checkout](#orders--checkout)
4. [Payments (Stripe)](#payments-stripe)
5. [Chat](#chat)
6. [Tracking](#tracking)
7. [Admin](#admin)

---

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "FARMER" // or SUPPLIER, AGRO_EXPERT, BUYER
}

Response: 201
{
  "message": "User created successfully",
  "userId": 1,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "message": "Login successful",
  "userId": 1,
  "role": "FARMER",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Complete Expert Profile
```http
POST /auth/expert-profile
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Field "cv": [file.pdf]
Field "specialization": "Crop Management"
Field "experience": "10 years in agriculture"
Field "bio": "Expert in sustainable farming"

Response: 200
{
  "message": "Expert profile created",
  "isApproved": false,
  "cvFilePath": "uploads/cv/user_1_cv.pdf"
}
```

---

## Marketplace (Split)

### Get Crop Market Products
```http
GET /marketplace/crop-products
Authorization: Optional

Response: 200
{
  "products": [
    {
      "id": 1,
      "title": "Tomatoes (1kg)",
      "description": "Fresh organic tomatoes",
      "category": "PRODUCE",
      "price": 50,
      "unit": "kg",
      "imageUrl": "https://...",
      "marketplaceType": "CROP_MARKET",
      "User": {
        "id": 5,
        "firstName": "Ahmed",
        "lastName": "Farmer"
      }
    }
  ]
}
```

### Create Crop Market Product
```http
POST /marketplace/crop-products
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Tomatoes (1kg)",
  "description": "Fresh organic tomatoes",
  "category": "PRODUCE",
  "price": 50,
  "unit": "kg",
  "imageUrl": "https://...",
  "quantity": 100
}

Response: 201
{
  "id": 1,
  "marketplaceType": "CROP_MARKET",
  "message": "Product created successfully"
}

Errors:
403: "Only farmers can add to Crop Market"
```

### Get Agri Shop Products
```http
GET /marketplace/agri-products
Authorization: Optional

Response: 200
{
  "products": [
    {
      "id": 10,
      "title": "Fertilizer (50kg)",
      "description": "NPK 20-20-20",
      "category": "FERTILIZERS",
      "price": 1500,
      "unit": "bag",
      "marketplaceType": "AGRI_MARKET",
      "User": { "id": 8, "firstName": "Hassan", "lastName": "Supplier" }
    }
  ]
}
```

### Create Agri Shop Product
```http
POST /marketplace/agri-products
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Fertilizer (50kg)",
  "description": "NPK 20-20-20",
  "category": "FERTILIZERS",
  "price": 1500,
  "unit": "bag",
  "imageUrl": "https://...",
  "quantity": 50
}

Response: 201
{
  "id": 10,
  "marketplaceType": "AGRI_MARKET",
  "message": "Product created successfully"
}

Errors:
403: "Only suppliers can add to Agri Shop"
```

### Search Products
```http
GET /marketplace/search?q=tomato&marketplace=crop&category=PRODUCE
Authorization: Optional

Query Parameters:
- q: Search term (optional)
- marketplace: "crop" | "agri" (optional)
- category: Product category (optional)

Response: 200
{
  "products": [
    { "id": 1, "title": "Tomatoes", "marketplaceType": "CROP_MARKET" }
  ]
}
```

### Get Product Details
```http
GET /marketplace/products/{productId}
Authorization: Optional

Response: 200
{
  "id": 1,
  "title": "Tomatoes (1kg)",
  "description": "Fresh organic tomatoes",
  "price": 50,
  "unit": "kg",
  "category": "PRODUCE",
  "imageUrl": "https://...",
  "marketplaceType": "CROP_MARKET",
  "User": { "id": 5, "firstName": "Ahmed" }
}
```

### Get Expert Listings
```http
GET /marketplace/expert-listings
Authorization: Optional

Response: 200
{
  "listings": [
    {
      "id": 1,
      "userId": 3,
      "specialization": "Crop Management",
      "experience": "10 years",
      "bio": "Expert in sustainable farming",
      "ratePerHour": 500,
      "User": {
        "id": 3,
        "firstName": "Dr.",
        "lastName": "Expert",
        "isApproved": true
      }
    }
  ]
}

Note: Returns ONLY isApproved = true experts
```

### Create Expert Listing
```http
POST /marketplace/expert-listings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "specialization": "Crop Management",
  "experience": "10 years",
  "bio": "Expert in sustainable farming",
  "ratePerHour": 500
}

Response: 201
{
  "id": 1,
  "message": "Expert listing created"
}

Errors:
403: "Only approved experts can create listings"
400: "CV upload required for expert status"
```

---

## Orders & Checkout

### Create Single-Product Order
```http
POST /orders
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 5,
  "shippingAddress": "123 Farm Road, Cairo, Egypt",
  "paymentMethod": "STRIPE"
}

Response: 201
{
  "orderId": 1,
  "totalAmount": 250.50,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "message": "Order created successfully. Please complete payment."
}
```

### Checkout (Multi-Item)
```http
POST /orders/checkout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 5,
      "type": "crop"
    },
    {
      "productId": 10,
      "quantity": 2,
      "type": "agri"
    }
  ],
  "shippingAddress": "123 Farm Road, Cairo, Egypt",
  "paymentMethod": "STRIPE"
}

Response: 201
{
  "orderId": 1,
  "totalAmount": 3500.00,
  "itemsCount": 2,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "message": "Order created. Proceed to payment."
}
```

### Get User Orders
```http
GET /orders
Authorization: Bearer {accessToken}

Response: 200
{
  "orders": [
    {
      "id": 1,
      "status": "PROCESSING",
      "paymentStatus": "PAID",
      "totalAmount": 250.50,
      "createdAt": "2024-01-15T10:00:00Z",
      "OrderItems": [
        {
          "id": 1,
          "productId": 1,
          "title": "Tomatoes",
          "quantity": 5,
          "price": 50,
          "totalPrice": 250,
          "marketplaceType": "CROP_MARKET"
        }
      ]
    }
  ]
}

Role-Based Filtering:
- FARMER: Sees only CROP_MARKET orders
- SUPPLIER: Sees only AGRI_MARKET orders
- ADMIN: Sees all orders
```

### Get Order By ID
```http
GET /orders/{orderId}
Authorization: Bearer {accessToken}

Response: 200
{
  "id": 1,
  "status": "PROCESSING",
  "paymentStatus": "PAID",
  "totalAmount": 250.50,
  "shippingAddress": "123 Farm Road, Cairo, Egypt",
  "createdAt": "2024-01-15T10:00:00Z",
  "OrderItems": [
    {
      "id": 1,
      "productId": 1,
      "title": "Tomatoes",
      "quantity": 5,
      "price": 50,
      "totalPrice": 250,
      "marketplaceType": "CROP_MARKET"
    }
  ]
}
```

### Update Order Status (Admin)
```http
PATCH /orders/{orderId}/status
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "status": "SHIPPED"
}

Valid statuses: PROCESSING, SHIPPED, DELIVERED, CANCELLED

Response: 200
{
  "message": "Order status updated to SHIPPED",
  "order": { "id": 1, "status": "SHIPPED" }
}
```

### Get All Orders (Admin)
```http
GET /orders/admin/all
Authorization: Bearer {adminToken}

Response: 200
{
  "orders": [
    {
      "id": 1,
      "userId": 5,
      "totalAmount": 250.50,
      "status": "PROCESSING",
      "paymentStatus": "PAID",
      "User": { "id": 5, "email": "farmer@example.com" },
      "OrderItems": [...]
    }
  ]
}
```

---

## Payments (Stripe)

### Create Payment Intent
```http
POST /payments/intent
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "orderId": 1
}

Response: 200
{
  "clientSecret": "pi_1234567890_secret_1234567890",
  "paymentIntentId": "pi_1234567890",
  "amount": 25050,  // in cents
  "currency": "EGP",
  "message": "Payment intent created successfully"
}
```

### Confirm Payment
```http
POST /payments/confirm
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "orderId": 1,
  "paymentIntentId": "pi_1234567890"
}

Response: 200
{
  "message": "Payment confirmed successfully",
  "order": {
    "id": 1,
    "status": "PROCESSING",
    "paymentStatus": "PAID"
  }
}
```

### Get Payment Status
```http
GET /payments/{orderId}/status
Authorization: Bearer {accessToken}

Response: 200
{
  "orderId": 1,
  "paymentStatus": "PAID",
  "orderStatus": "PROCESSING",
  "totalAmount": 250.50,
  "paymentMethod": "STRIPE",
  "paymentDate": "2024-01-15T10:30:00Z"
}
```

### Webhook (Stripe → Backend)
```http
POST /payments/webhook
Authorization: None (Stripe signature verification)
Content-Type: application/json
Stripe-Signature: t=timestamp,v1=signature

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "metadata": {
        "orderId": "1"
      }
    }
  }
}

Response: 200
{ "received": true }

Auto-updates order:
- payment_intent.succeeded → Order.paymentStatus = PAID, Order.status = PROCESSING
- payment_intent.payment_failed → Order.paymentStatus = FAILED
```

---

## Chat

### Send Message
```http
POST /chat/messages
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "receiverId": 10,
  "message": "Hello, I need expert advice on crop rotation.",
  "attachmentUrl": "https://..." // optional
}

Response: 201
{
  "id": 1,
  "senderId": 5,
  "receiverId": 10,
  "message": "Hello, I need expert advice on crop rotation.",
  "isRead": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Get Chat History
```http
GET /chat/messages/{userId}?page=1&limit=50
Authorization: Bearer {accessToken}

Response: 200
{
  "messages": [
    {
      "id": 1,
      "senderId": 5,
      "receiverId": 10,
      "message": "Hello, I need expert advice.",
      "isRead": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "page": 1,
  "total": 100
}
```

### Get Conversations
```http
GET /chat/conversations?page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200
{
  "conversations": [
    {
      "userId": 10,
      "userName": "Dr. Expert",
      "lastMessage": "You're welcome!",
      "lastMessageTime": "2024-01-15T15:30:00Z",
      "unreadCount": 0
    }
  ]
}
```

### Mark Message As Read
```http
PUT /chat/messages/{messageId}/read
Authorization: Bearer {accessToken}

Response: 200
{ "message": "Message marked as read" }
```

### Get Unread Count
```http
GET /chat/unread-count
Authorization: Bearer {accessToken}

Response: 200
{
  "unreadCount": 3,
  "conversations": {
    "10": 2,
    "12": 1
  }
}
```

---

## Tracking

### Get Order Tracking
```http
GET /tracking/orders?status=SHIPPED&userId=5
Authorization: Bearer {accessToken}

Query Parameters:
- status: PENDING, PROCESSING, SHIPPED, DELIVERED (optional)
- userId: Filter by user (admin only)

Response: 200
{
  "orders": [
    {
      "orderId": 1,
      "status": "SHIPPED",
      "currentLocation": "Cairo Distribution Center",
      "estimatedDelivery": "2024-01-18",
      "lastUpdate": "2024-01-16T09:00:00Z"
    }
  ]
}
```

### Get Product Tracking
```http
GET /tracking/products/{productId}
Authorization: Optional

Response: 200
{
  "productId": 1,
  "title": "Tomatoes",
  "activeOrders": 5,
  "stockLevel": 95,
  "recentActivity": [
    {
      "orderId": 1,
      "quantity": 5,
      "orderDate": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Admin

### Get Admin Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer {adminToken}

Response: 200
{
  "totalOrders": 150,
  "totalRevenue": 50000,
  "pendingApprovals": 5,
  "activeExperts": 12,
  "topProducts": [
    { "id": 1, "title": "Tomatoes", "sales": 45 }
  ]
}
```

### Approve Expert
```http
POST /admin/experts/{userId}/approve
Authorization: Bearer {adminToken}

Response: 200
{ "message": "Expert approved", "user": { "id": 5, "isApproved": true } }
```

### Reject Expert
```http
POST /admin/experts/{userId}/reject
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "reason": "CV not professional enough"
}

Response: 200
{ "message": "Expert rejected" }
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Server Error |

### Common Errors

```json
{
  "message": "Invalid credentials",
  "code": "AUTH_INVALID"
}

{
  "message": "Token expired",
  "code": "TOKEN_EXPIRED"
}

{
  "message": "Only farmers can add to Crop Market",
  "code": "ROLE_FORBIDDEN"
}

{
  "message": "Order not found",
  "code": "NOT_FOUND"
}

{
  "message": "CV upload required for expert status",
  "code": "CV_REQUIRED"
}
```

---

## Testing with cURL

### Test Farmer Creating Crop Product
```bash
curl -X POST http://localhost:5002/marketplace/crop-products \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tomatoes",
    "description": "Fresh organic",
    "category": "PRODUCE",
    "price": 50,
    "unit": "kg",
    "quantity": 100
  }'
```

### Test Stripe Payment
```bash
curl -X POST http://localhost:5002/payments/intent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

### Test Expert Listing
```bash
curl -X GET http://localhost:5002/marketplace/expert-listings
```

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Pagination

Most list endpoints support:
- `?page=1` (default: 1)
- `?limit=20` (default: 20, max: 100)

---

## Timestamp Format

All timestamps are in ISO 8601 format: `2024-01-15T10:00:00Z`

---

## Base URL

**Development**: `http://localhost:5002`  
**Production**: `https://api.zar3a.com`

---

## Support

For API issues:
1. Check the error message and code
2. Verify request format matches documentation
3. Check authentication token validity
4. Contact support@zar3a.com
