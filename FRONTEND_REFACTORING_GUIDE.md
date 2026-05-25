# Zar3a Marketplace Frontend Refactoring Guide (v2.0.0)

## Overview
This guide covers all frontend changes needed to match the backend v2.0.0 refactor.

---

## 1. CART STATE MANAGEMENT FIX

### Create: `src/hooks/useCart.js`
```javascript
import { useState, useEffect } from 'react';

const CART_KEY = 'zar3a_cart_v2';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
    setIsMounted(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product, type) => {
    // type: 'crop' or 'agri'
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === product.id && item.type === type
      );

      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id && item.type === type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          unit: product.unit,
          type, // ← IMPORTANT: track which marketplace
          quantity: 1,
          marketplaceType: product.marketplaceType,
        },
      ];
    });
  };

  const removeFromCart = (productId, type) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.type === type)));
  };

  const updateQuantity = (productId, type, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, type);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.type === type ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
  };
};
```

---

## 2. SPLIT MARKETPLACE PAGES

### Create: `src/pages/Marketplace/CropMarket.jsx`
```javascript
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { marketplaceAPI } from '../../API/axiosInstance';
// ... (similar to current Marketplace but calls getCropMarketProducts & createCropMarketProduct)
```

### Create: `src/pages/Marketplace/AgriShop.jsx`
```javascript
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { marketplaceAPI } from '../../API/axiosInstance';
// ... (similar to current Marketplace but calls getAgriShopProducts & createAgriShopProduct)
```

### Update: `src/routes/router.jsx`
```javascript
import CropMarket from '../pages/Marketplace/CropMarket';
import AgriShop from '../pages/Marketplace/AgriShop';

// In routes array:
{ path: 'crop-market', element: <CropMarket /> },
{ path: 'agri-shop', element: <AgriShop /> },
{ path: 'marketplace', element: <Navigate to="/crop-market" /> }, // redirect
```

---

## 3. PROPER TRACK ORDERS PAGE

### Create: `src/pages/TrackOrders/TrackOrders.jsx`
```javascript
import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../../API/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const TrackOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await ordersAPI.getUserOrders();
      // Data is already filtered by backend based on user role/marketplace
      setOrders(data.orders || data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700';
      case 'PAID': return 'bg-green-50 text-green-700';
      case 'FAILED': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
        <p className="text-gray-600">Start shopping to create your first order</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Track Your Orders</h1>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  EGP {Number(order.totalAmount).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                Payment: {order.paymentStatus}
              </span>
            </div>

            {selectedOrder === order.id && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <h4 className="font-bold mb-4">Order Items</h4>
                {order.OrderItems?.map((item) => (
                  <div key={item.id} className="flex gap-4 mb-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold">{item.title}</h5>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-sm">
                        {item.quantity} x {item.unit} @ EGP {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">EGP {Number(item.totalPrice).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{item.marketplaceType === 'CROP_MARKET' ? '🌾 Crop' : '🏪 Agri'}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-semibold mb-2">Shipping Address</h5>
                  <p className="text-sm">{order.shippingAddress}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackOrders;
```

---

## 4. PAYMENT PAGE

### Create: `src/pages/Payment/Payment.jsx`
```javascript
import React, { useState } from 'react';
import { loadStripe } from '@stripe/js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsAPI, ordersAPI } from '../../API/axiosInstance';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const CheckoutForm = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Get payment intent
      const { data } = await paymentsAPI.createPaymentIntent(orderId);
      const { clientSecret, paymentIntentId } = data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Confirm with backend
        await paymentsAPI.confirmPayment(orderId, paymentIntentId);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay EGP ${amount.toLocaleString()}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data } = await ordersAPI.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm
          orderId={orderId}
          amount={order.totalAmount}
          onSuccess={() => {
            alert('Payment successful!');
            navigate('/track-orders');
          }}
        />
      </Elements>
    </div>
  );
};

export default Payment;
```

---

## 5. UPDATE AUTH CONTEXT

### Key Changes to `src/context/AuthContext.jsx`:
```javascript
// Update all marketplace calls
getMarketplaceProducts: async (type = 'crop') => {
  const { data } = await marketplaceAPI[
    type === 'crop' ? 'getCropMarketProducts' : 'getAgriShopProducts'
  ]();
  return data;
},

createMarketplaceProduct: async (type, data) => {
  const { data: product } = await marketplaceAPI[
    type === 'crop' ? 'createCropMarketProduct' : 'createAgriShopProduct'
  ](data);
  return product;
},

// Cart operations
checkout: async (items, shippingAddress) => {
  const { data } = await ordersAPI.checkout(items, shippingAddress, 'STRIPE');
  return data; // Returns orderId for payment
},

getUserOrders: async () => {
  const { data } = await ordersAPI.getUserOrders();
  return data;
},
```

---

## 6. ENVIRONMENT VARIABLES

### Update `.env` in Zar3a folder:
```
VITE_API_URL=http://localhost:5002
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_KEY
```

---

## 7. PACKAGE.JSON UPDATES

### Add to Zar3a/package.json:
```json
{
  "dependencies": {
    "@stripe/react-stripe-js": "^2.0.0",
    "@stripe/js": "^3.0.0"
  }
}
```

---

## 8. NAVBAR UPDATES

Update navbar to show:
- Crop Market (🌾)
- Agri Shop (🏪)
- Cart
- Track Orders
- Experts

Remove:
- Single "Marketplace" link
- AI Assistant (for guests)

---

## 9. DASHBOARD CLEANUP

Hide for non-admin users:
- Settings
- AI Assistant
- Admin controls

Show only:
- Personal info
- Orders summary
- Profile completion

---

## KEY CHANGES SUMMARY

| Component | Old | New |
|-----------|-----|-----|
| **Cart** | localStorage only | localStorage + DB backup on checkout |
| **Marketplace** | Single page | Split into CropMarket + AgriShop |
| **Products** | All mixed | Filtered by marketplaceType |
| **Orders** | No payment tracking | PENDING → PROCESSING → SHIPPED → DELIVERED |
| **Payment** | Not implemented | Stripe integration |
| **Roles** | Any role can add products | FARMER→Crop, SUPPLIER→Agri |
| **Expert** | Can list immediately | Must be APPROVED + CV required |
| **Chat** | Save not guaranteed | Persistent DB + real-time ready |

---

## TESTING CHECKLIST

- [ ] Farmer can only add to Crop Market
- [ ] Supplier can only add to Agri Shop
- [ ] Cart shows products from both marketplaces
- [ ] Checkout creates order with PENDING status
- [ ] Payment processing updates order to PROCESSING
- [ ] Track Orders shows only relevant orders by role
- [ ] Expert must have CV + approval before listing
- [ ] Chat messages persist and load correctly
- [ ] Admin can see all orders

---

## MIGRATION STEPS

1. Backend update and test (COMPLETED)
2. Update frontend API layer (COMPLETED - axiosInstance.js)
3. Create new Cart hook
4. Create split Marketplace pages
5. Create TrackOrders page
6. Create Payment page
7. Update AuthContext
8. Update Navbar/routing
9. Clean dashboard
10. Test all flows

---

## STRIPE SETUP

1. Create Stripe account at stripe.com
2. Get API keys from dashboard
3. Add to .env:
   - STRIPE_PUBLISHABLE_KEY (frontend)
   - STRIPE_SECRET_KEY (backend)
   - STRIPE_WEBHOOK_SECRET (backend)
4. Install Stripe npm packages
5. Set webhook endpoint in Stripe dashboard to: `https://yourapi.com/payments/webhook`
