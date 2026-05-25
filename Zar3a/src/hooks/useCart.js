import { useState, useEffect } from 'react';
import { cartAPI } from '../API/axiosInstance';

const BASE_CART_STORAGE_KEY = 'zar3a_cart';
const getCartStorageKey = (userId) => (userId ? `${BASE_CART_STORAGE_KEY}_${userId}` : BASE_CART_STORAGE_KEY);

export const useCart = (userId) => {
  const [cart, setCart] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const cartKey = getCartStorageKey(userId);

  // Load cart from localStorage or backend on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Try to get from localStorage first
        const saved = localStorage.getItem(cartKey);
        if (saved) {
          try {
            setCart(JSON.parse(saved));
          } catch (error) {
            console.error('Failed to parse cart from storage', error);
          }
        }

        // If user is logged in, sync with backend
        if (userId) {
          try {
            const { items } = await cartAPI.getCart();
            if (items && items.length > 0) {
              setCart(items);
              localStorage.setItem(cartKey, JSON.stringify(items));
            }
          } catch (err) {
            console.error('Failed to sync cart from backend:', err);
          }
        }
      } finally {
        setInitialized(true);
      }
    };

    initializeCart();
  }, [cartKey, userId]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, initialized, cartKey]);

  // Sync with backend whenever cart changes (if user is logged in)
  useEffect(() => {
    if (!initialized || !userId || syncing) return;

    const syncCart = async () => {
      setSyncing(true);
      try {
        await cartAPI.updateCart(cart);
      } catch (err) {
        console.error('Failed to sync cart to backend:', err);
      } finally {
        setSyncing(false);
      }
    };

    const timeout = setTimeout(syncCart, 500); // Debounce syncing
    return () => clearTimeout(timeout);
  }, [cart, initialized, userId, syncing]);

  const addToCart = (product, type = 'crop') => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id && item.type === type);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.type === type
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl || product.image || '',
          unit: product.unit || 'unit',
          type,
          quantity: 1,
          marketplaceType: product.marketplaceType || (type === 'crop' ? 'CROP_MARKET' : 'AGRI_MARKET'),
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
        item.productId === productId && item.type === type ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    cart,
    initialized,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };
};
