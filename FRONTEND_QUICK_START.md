# Zar3a v2.0.0 - FRONTEND QUICK REFERENCE

**Use this for rapid implementation of frontend components**

---

## 1️⃣ CREATE CART HOOK (5 min)

**File**: `src/hooks/useCart.js`

```javascript
import { useState, useEffect } from 'react';

const CART_KEY = 'zar3a_cart_v2';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) setCart(JSON.parse(saved));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, isMounted]);

  return {
    cart,
    addToCart: (product, type) => setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.type === type);
      return existing
        ? prev.map(i => i.productId === product.id && i.type === type ? {...i, quantity: i.quantity + 1} : i)
        : [...prev, {productId: product.id, title: product.title, price: product.price, type, quantity: 1}];
    }),
    removeFromCart: (productId, type) => setCart(prev => prev.filter(i => !(i.productId === productId && i.type === type))),
    updateQuantity: (productId, type, qty) => qty < 1 
      ? setCart(prev => prev.filter(i => !(i.productId === productId && i.type === type)))
      : setCart(prev => prev.map(i => i.productId === productId && i.type === type ? {...i, quantity: qty} : i)),
    clearCart: () => setCart([]),
    getTotalPrice: () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
};
```

---

## 2️⃣ CROP MARKET PAGE (10 min)

**File**: `src/pages/Marketplace/CropMarket.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { marketplaceAPI } from '../../API/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function CropMarket() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await marketplaceAPI.getCropMarketProducts();
      setProducts(data.products || data);
    } catch (err) {
      console.error('Failed to load crop products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">🌾 Crop Market</h1>

      {user?.role === 'FARMER' && (
        <button className="mb-8 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold">
          Add Crop Product
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover rounded mb-4" />}
            <h3 className="text-xl font-bold mb-2">{product.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{product.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-emerald-600">EGP {Number(product.price).toLocaleString()}</span>
              <span className="text-sm text-gray-500">{product.unit}</span>
            </div>
            <button
              onClick={() => addToCart(product, 'crop')}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3️⃣ AGRI SHOP PAGE (10 min)

**File**: `src/pages/Marketplace/AgriShop.jsx` (Same as CropMarket, but change):

```javascript
// Change these lines:
const loadProducts = async () => {
  const { data } = await marketplaceAPI.getAgriShopProducts();  // ← DIFFERENT
  setProducts(data.products || data);
};

return (
  <div className="p-8 max-w-7xl mx-auto">
    <h1 className="text-4xl font-bold mb-8">🏪 Agri Shop</h1>  {/* ← DIFFERENT */}

    {user?.role === 'SUPPLIER' && (  {/* ← DIFFERENT */}
      <button className="mb-8 px-6 py-3 bg-amber-600 text-white rounded-lg font-bold">
        Add Supply Product
      </button>
    )}

    // ... rest same, but:
    onClick={() => addToCart(product, 'agri')}  {/* ← DIFFERENT */}
```

---

## 4️⃣ TRACK ORDERS PAGE (15 min)

**File**: `src/pages/TrackOrders/TrackOrders.jsx`

```javascript
import { useEffect, useState } from 'react';
import { ordersAPI } from '../../API/axiosInstance';

export default function TrackOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ordersAPI.getUserOrders();
        setOrders(data.orders || data);
      } catch (err) {
        console.error('Failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!orders.length) return <div className="p-8 text-center">No orders yet</div>;

  const statusColor = (status) => ({
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
  }[status] || 'bg-gray-100');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Track Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            className="bg-white dark:bg-slate-800 p-6 rounded-lg border cursor-pointer hover:shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {expanded === order.id && (
              <div className="mt-6 pt-6 border-t">
                <p className="font-bold mb-4">Items: {order.OrderItems?.length}</p>
                {order.OrderItems?.map(item => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded mb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{item.title}</span>
                      <span>EGP {Number(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.quantity} x {item.unit}</p>
                  </div>
                ))}
                <p className="mt-4 font-bold text-lg">Total: EGP {Number(order.totalAmount).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5️⃣ PAYMENT PAGE (20 min)

**First, install Stripe:**
```bash
npm install @stripe/react-stripe-js @stripe/js
```

**File**: `src/pages/Payment/Payment.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsAPI, ordersAPI } from '../../API/axiosInstance';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await paymentsAPI.createPaymentIntent(orderId);
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await paymentsAPI.confirmPayment(orderId, data.paymentIntentId);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay EGP ${amount.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ordersAPI.getOrderById(orderId);
        setOrder(data);
      } catch {
        console.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8">Order not found</div>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Complete Payment</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm
          orderId={orderId}
          amount={order.totalAmount}
          onSuccess={() => {
            alert('✅ Payment successful!');
            navigate('/track-orders');
          }}
        />
      </Elements>
    </div>
  );
}
```

---

## 6️⃣ UPDATE ROUTES (5 min)

**File**: `src/routes/router.jsx` (Add these):

```javascript
import CropMarket from '../pages/Marketplace/CropMarket';
import AgriShop from '../pages/Marketplace/AgriShop';
import TrackOrders from '../pages/TrackOrders/TrackOrders';
import Payment from '../pages/Payment/Payment';

// In your routes array:
{
  path: '/crop-market',
  element: <CropMarket />
},
{
  path: '/agri-shop',
  element: <AgriShop />
},
{
  path: '/track-orders',
  element: <TrackOrders />
},
{
  path: '/payment/:orderId',
  element: <Payment />
},
// Optional: redirect old marketplace link
{
  path: '/marketplace',
  element: <Navigate to="/crop-market" replace />
}
```

---

## 7️⃣ UPDATE NAVBAR (5 min)

**File**: `src/components/Navbar/Navbar.jsx`

```javascript
// Replace marketplace link with:
<Link to="/crop-market" className="...">🌾 Crop Market</Link>
<Link to="/agri-shop" className="...">🏪 Agri Shop</Link>
<Link to="/track-orders" className="...">📦 Track Orders</Link>

// Remove or hide for guests:
// <Link to="/ai-assistant" ... /> ← HIDE
// <Link to="/settings" ... /> ← HIDE
```

---

## 8️⃣ .ENV FILE (2 min)

**File**: `Zar3a/.env`

```env
VITE_API_URL=http://localhost:5002
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

Get Stripe key from: https://dashboard.stripe.com/apikeys

---

## ✅ TESTING CHECKLIST

- [ ] Farmer can add to crop market
- [ ] Farmer CANNOT add to agri shop
- [ ] Supplier can add to agri shop
- [ ] Supplier CANNOT add to crop market
- [ ] Cart persists in localStorage
- [ ] Checkout creates PENDING order
- [ ] Payment page loads
- [ ] Stripe test card: 4242 4242 4242 4242 (expires: 12/25)
- [ ] Payment succeeds → order updates to PROCESSING
- [ ] Track Orders shows only user's orders
- [ ] Admin sees all orders

---

## 🚀 TOTAL IMPLEMENTATION TIME

- useCart hook: 5 min
- CropMarket page: 10 min
- AgriShop page: 5 min
- TrackOrders page: 15 min
- Payment page: 20 min
- Routes update: 5 min
- Navbar update: 5 min
- Testing: 20 min

**TOTAL: ~85 minutes** (1.5 hours) for complete frontend

---

## 🆘 COMMON ISSUES

**"Module not found: @stripe/react-stripe-js"**
```bash
npm install @stripe/react-stripe-js @stripe/js
```

**"API call returns 403"**
→ Check your user role (must be FARMER for crop, SUPPLIER for agri)

**"Payment returns 402"**
→ Use Stripe test card: 4242 4242 4242 4242

**"Cart not persisting"**
→ Check browser Storage tab, verify CART_KEY matches

**"useCart is not exported"**
→ Make sure you created the hooks folder and useCart.js

---

## 📞 DEBUGGING

**Check network requests:**
```javascript
// In your browser DevTools:
// 1. Network tab
// 2. Filter: XHR
// 3. Click an API call
// 4. Check Status & Response
```

**Check localStorage:**
```javascript
// In console:
localStorage.getItem('zar3a_cart_v2')  // Show cart
localStorage.getItem('accessToken')   // Show token
```

**Check Stripe test:**
→ Visit https://dashboard.stripe.com/test/dashboard
→ Use test card: 4242 4242 4242 4242

---

## 📚 FULL DOCUMENTATION

For detailed info, see:
- [FRONTEND_REFACTORING_GUIDE.md](FRONTEND_REFACTORING_GUIDE.md)
- [BACKEND_SETUP_GUIDE.md](BACKEND_SETUP_GUIDE.md)
- [REFACTORING_COMPLETE_SUMMARY.md](REFACTORING_COMPLETE_SUMMARY.md)
