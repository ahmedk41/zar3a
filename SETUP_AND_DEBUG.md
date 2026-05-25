# Complete Setup & Debug Guide

## Step 1: Database Migration (CRITICAL)

This is the most likely cause of project failure. The OrderItems table needs the `ownerId` column added.

### Option A: Sequelize Auto-Sync (Recommended for Development)

In your backend `server.js`, ensure this is enabled:

```javascript
// After imports, before starting server
const syncDatabase = async () => {
  try {
    // This will automatically add the ownerId column if it doesn't exist
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');
  } catch (err) {
    console.error('❌ Database sync failed:', err.message);
    process.exit(1);
  }
};
```

Then call it before starting the server:

```javascript
const startServer = async () => {
  await syncDatabase(); // Add this line
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};
```

### Option B: Manual SQL Migration

If using MySQL:

```sql
-- Check if ownerId column exists
DESCRIBE OrderItems;

-- If ownerId is NOT shown, add it:
ALTER TABLE OrderItems ADD COLUMN ownerId INT NOT NULL DEFAULT 1 AFTER totalPrice;

-- Add foreign key
ALTER TABLE OrderItems ADD CONSTRAINT fk_orderitems_owner 
  FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_orderitems_owner_marketplace ON OrderItems(ownerId, marketplaceType);
CREATE INDEX idx_orderitems_payment ON OrderItems(paymentStatus);

-- Verify
DESCRIBE OrderItems;
```

### Option C: Reset Everything (Nuclear Option)

If nothing works:

```bash
# Stop backend server
Ctrl+C

# Delete database completely (CAREFUL: Loses all data)
# Then restart - Sequelize will recreate with correct schema
npm run dev
```

---

## Step 2: Verify Backend Files Exist

Run these commands to verify all new files were created:

```bash
# Navigate to backend
cd "zar3a-backend copy"

# Check Cart model exists
test -f src/models/Cart.js && echo "✅ Cart.js exists" || echo "❌ Cart.js missing"

# Check Cart controller exists
test -f src/controllers/cart.controller.js && echo "✅ cart.controller.js exists" || echo "❌ cart.controller.js missing"

# Check Cart routes exist  
test -f src/routes/cart.routes.js && echo "✅ cart.routes.js exists" || echo "❌ cart.routes.js missing"

# Verify Cart is exported from models
grep "Cart" src/models/index.js && echo "✅ Cart in models/index.js" || echo "❌ Cart missing from models/index.js"

# Verify cart routes are mounted
grep "cartRoutes" src/server.js && echo "✅ cartRoutes in server.js" || echo "❌ cartRoutes missing from server.js"
```

---

## Step 3: Clean Start Backend

```bash
# 1. Stop the server
# Press Ctrl+C in the running terminal

# 2. Install dependencies (if needed)
cd "zar3a-backend copy"
npm install

# 3. Start fresh
npm run dev

# 4. Watch for this success message:
# ✅ Database synced successfully
# ✅ Server running on http://localhost:5002
```

---

## Step 4: Test Backend Endpoints

### Test 1: Health Check
```bash
curl http://localhost:5002
# Should return: {"status":"ok","project":"Zar3a API 🌱","version":"2.0.0"}
```

### Test 2: Cart Endpoint (requires auth token)
```bash
# Replace TOKEN with actual JWT token
TOKEN="your_actual_token_here"

curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5002/cart

# Should return: {"items":[],"totalAmount":0}
```

### Test 3: Orders Endpoint (requires auth token)
```bash
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5002/orders

# Should return: {"count":0,"orders":[]}
```

### Test 4: Tracking Endpoint (requires auth token)
```bash
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5002/tracking/orders

# Should return: {"total":0,"page":1,"limit":20,"pages":0,"items":[]}
```

---

## Step 5: Test Frontend

### In Browser Console (F12):

```javascript
// Check if you're logged in
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);

// Check if token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Test API call
fetch('http://localhost:5002/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('Orders response:', data))
.catch(err => console.error('Orders error:', err));
```

---

## Step 6: Test Role-Based Filtering

### Login as Different Roles and Test:

**Test as BUYER:**
- View Track Orders (should show all items)
- View /orders (should show all their purchases)
- Sidebar should SHOW "Track Orders" menu item

**Test as FARMER:**
- View Track Orders (should show ONLY Crop Market items)
- View /orders (should show ONLY items they own)
- Sidebar should SHOW "Track Orders" menu item

**Test as SUPPLIER:**
- View Track Orders (should show ONLY Agri Market items)
- View /orders (should show ONLY items they own)  
- Sidebar should SHOW "Track Orders" menu item

**Test as AGRO_EXPERT:**
- View Track Orders (should show "Access Denied")
- Sidebar should NOT SHOW "Track Orders" menu item
- Trying to access /track-orders directly should redirect

**Test as ADMIN:**
- View Track Orders (should show ALL items)
- View /orders (should show all orders)
- Sidebar should SHOW "Track Orders" menu item

---

## Step 7: Check Browser Console for Errors

If the frontend isn't working:

1. Open Browser DevTools (F12)
2. Click "Console" tab
3. Look for red error messages
4. Common errors:
   - `Cannot read property of undefined` - Check if user data is loaded
   - `401 Unauthorized` - Check if token is expired
   - `404 Not Found` - Check if backend endpoint exists

---

## Step 8: Full Error Diagnostics

If you still have errors, run this in browser console:

```javascript
// Diagnostic script
async function diagnose() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  console.log('=== DIAGNOSTICS ===');
  console.log('User:', user);
  console.log('Token exists:', !!token);
  console.log('Token expires:', user?.expiresAt);
  
  // Test backend connection
  try {
    const health = await fetch('http://localhost:5002').then(r => r.json());
    console.log('✅ Backend health:', health);
  } catch (e) {
    console.error('❌ Backend not responding:', e.message);
  }
  
  // Test auth endpoint
  if (token) {
    try {
      const orders = await fetch('http://localhost:5002/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
      console.log('✅ Orders endpoint:', orders);
    } catch (e) {
      console.error('❌ Orders endpoint error:', e.message);
    }
  }
}

// Run it
diagnose();
```

---

## Step 9: Important Files Summary

### Backend Files Modified:
- ✅ `zar3a-backend copy/src/models/OrderItem.js` - Added ownerId field
- ✅ `zar3a-backend copy/src/models/index.js` - Added Cart model
- ✅ `zar3a-backend copy/src/controllers/orders.controller.js` - Role-based filtering
- ✅ `zar3a-backend copy/src/server.js` - Added cart routes

### Backend Files Created:
- ✅ `zar3a-backend copy/src/models/Cart.js`
- ✅ `zar3a-backend copy/src/controllers/cart.controller.js`
- ✅ `zar3a-backend copy/src/routes/cart.routes.js`

### Frontend Files Modified:
- ✅ `Zar3a/src/pages/TrackOrders/TrackOrders.jsx` - AGRO_EXPERT check
- ✅ `Zar3a/src/components/Sidebar/Sidebar.jsx` - Track Orders visibility

---

## Quick Fix Checklist

- [ ] Database migration applied (ownerId column added to OrderItems)
- [ ] All new backend files created (Cart.js, cart.controller.js, cart.routes.js)
- [ ] Backend server restarted after changes
- [ ] No red errors in backend console
- [ ] No red errors in browser console
- [ ] Can log in successfully
- [ ] Cart endpoints return data
- [ ] Orders endpoints return data
- [ ] Track Orders page shows appropriate role-based data
- [ ] Sidebar shows/hides menu items correctly by role

---

## If Issue Persists

1. **Share the exact error message** from:
   - Backend terminal (where npm run dev is running)
   - Browser console (F12 → Console tab)

2. **Provide:**
   - Database type (MySQL, PostgreSQL, SQLite)
   - Node.js version (`node --version`)
   - npm version (`npm --version`)

3. **Run and share output:**
   ```bash
   npm list | grep -E "sequelize|express|node"
   ```

---

## Success Indicators

When everything is working correctly, you should see:

**Backend Console:**
```
✅ Database synced successfully
✅ Server running on http://localhost:5002
```

**Browser:**
- Able to log in
- Sidebar shows menu items (or hides Track Orders for AGRO_EXPERT)
- No red errors in console
- API calls returning data

**API Responses:**
```javascript
// Orders
{count: 5, orders: [...]}

// Cart
{items: [...], totalAmount: 250}

// Tracking
{total: 10, items: [...]}
```
