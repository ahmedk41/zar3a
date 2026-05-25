# Project Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Backend Console Error
Open the terminal where `npm run dev` is running and look for:
- Syntax errors (red errors with line numbers)
- "Cannot find module" errors
- "Association error" messages  
- "Column doesn't exist" errors

**Common errors and fixes:**

#### Error: "Column 'ownerId' doesn't exist"
```
Solution: Run the database migration in DATABASE_MIGRATION.md
```

#### Error: "Cannot find module './Cart.js'"
```
Check that /zar3a-backend copy/src/models/Cart.js exists
Verify the export statement in models/index.js includes Cart
```

#### Error: "Cannot find module './cart.controller.js'"
```
Check that /zar3a-backend copy/src/controllers/cart.controller.js exists
Verify the import in cart.routes.js matches the filename exactly
```

### 2. Check Frontend Console Error
In browser DevTools Console (F12):
- Look for red errors
- Check Network tab for failed API requests
- Look for React-specific errors

### 3. Common Issues and Solutions

#### Issue: Backend won't start
**Check for:**
1. Database connection
2. Missing environment variables (.env file)
3. Port already in use (kill port 5002 if needed)

**To kill port 5002 on Mac:**
```bash
lsof -i :5002
kill -9 <PID>
```

#### Issue: Orders endpoint returns 500 error
**Likely cause:** ownerId column missing from OrderItems table
**Fix:** Run migration commands in DATABASE_MIGRATION.md

#### Issue: Cart API returns 404
**Likely cause:** Cart model not exported or routes not mounted
**Check:**
1. models/index.js exports Cart
2. server.js has `app.use('/cart', cartRoutes);`
3. cart.routes.js exists with correct exports

#### Issue: TrackOrders page shows "Access denied" but shouldn't
**Cause:** AGRO_EXPERT check in TrackOrders.jsx
**Check user.role value in browser DevTools**

### 4. Verify Key Files Exist

```bash
# Backend files
ls zar3a-backend\ copy/src/models/Cart.js
ls zar3a-backend\ copy/src/controllers/cart.controller.js
ls zar3a-backend\ copy/src/routes/cart.routes.js
ls zar3a-backend\ copy/src/controllers/orders.controller.js

# Frontend files  
ls Zar3a/src/pages/TrackOrders/TrackOrders.jsx
ls Zar3a/src/components/Sidebar/Sidebar.jsx
```

### 5. Full Restart Process

```bash
# Kill backend if running
Ctrl+C in the backend terminal

# Reset database (CAUTION: This deletes data)
# Option 1: Drop and recreate tables (Sequelize sync with alter: true)
# Option 2: Manually run SQL migration from DATABASE_MIGRATION.md

# Restart backend
cd "/zar3a-backend copy"
npm run dev

# In another terminal, start frontend if needed
cd Zar3a
npm run dev
```

### 6. Test Each Endpoint

**Test cart endpoints:**
```bash
# Get cart
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/cart

# Update cart (needs token)
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": []}' \
  http://localhost:5000/cart
```

**Test orders endpoints:**
```bash
# Get user's orders (role-filtered)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/orders

# Get tracking feed
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/tracking/orders
```

### 7. Database Connection Check

**Verify database is running:**
- MySQL: `mysql -u root -p -e "SELECT 1;"`
- PostgreSQL: `psql -U postgres -c "SELECT 1;"`

**Check OrderItems table structure:**
```sql
DESCRIBE OrderItems;
-- Should show: ownerId column (INT, FK to Users)
```

### 8. Recent Changes Summary

**Files modified that could cause errors:**
1. `zar3a-backend copy/src/models/OrderItem.js` - Added ownerId field
2. `zar3a-backend copy/src/models/index.js` - Added Cart model and associations
3. `zar3a-backend copy/src/controllers/orders.controller.js` - Rewrote listUserOrders function
4. `zar3a-backend copy/src/server.js` - Added cart routes mounting
5. `Zar3a/src/pages/TrackOrders/TrackOrders.jsx` - Added AGRO_EXPERT check
6. `Zar3a/src/components/Sidebar/Sidebar.jsx` - Updated Track Orders visibility

**New files created:**
- `zar3a-backend copy/src/models/Cart.js`
- `zar3a-backend copy/src/controllers/cart.controller.js`
- `zar3a-backend copy/src/routes/cart.routes.js`

### 9. Backend Health Check

```javascript
// Test this in server console to verify database connection
import { sequelize } from './models/index.js';
await sequelize.authenticate();
console.log('Database connected!');
```

### 10. Frontend Health Check

In browser console:
```javascript
// Check if user is authenticated
console.log(JSON.parse(localStorage.getItem('user')));

// Check API calls
fetch('http://localhost:5000/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log);
```

---

## If You Still Get Errors

1. **Share the exact error message** - Copy the full error including stack trace
2. **Check the backend console** - Look for red text with line numbers
3. **Check browser console** - Press F12 and look at Console tab
4. **Check Network tab** - See which API calls are failing and their responses

---

## Emergency Fix

If nothing works, try this full reset:

```bash
# Backend
cd "zar3a-backend copy"
rm -rf node_modules
npm install
npm run dev

# Frontend (in another terminal)
cd Zar3a
rm -rf node_modules
npm install
npm run dev
```

Then run the database migration from DATABASE_MIGRATION.md
