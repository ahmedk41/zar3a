import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuCreditCard, LuCheck, LuShoppingCart } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';

const Payment = () => {
  const { user, checkout, loading: authLoading } = useAuth();
  const { cart, initialized, clearCart } = useCart(user?.id);
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (authLoading || !initialized) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (!cart || cart.length === 0) {
      navigate('/marketplace');
    }
  }, [authLoading, initialized, user, cart, navigate]);

  const handlePay = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await checkout(
        cart.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity || item.qty,
          type:
            item.type ||
            (item.marketplaceType === 'AGRI_MARKET' ? 'agri' : 'crop') ||
            'crop',
        })),
        { shippingAddress: shippingAddress || null },
      );
      clearCart();
      setSuccess('Payment successful! Your order has been placed.');
      navigate('/track-orders');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to complete payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * (item.quantity || item.qty), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <LuArrowLeft /> Back to Cart
        </button>

        <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Secure Checkout</p>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Review your order</h1>
            </div>
            <div className="flex items-center gap-2 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-emerald-600 dark:text-emerald-200 font-semibold">
              <LuCreditCard size={20} /> Total: EGP {totalAmount.toLocaleString()}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => {
                  const quantity = item.quantity || item.qty;
                  const itemKey = item.productId || item.id || `${item.title}-${quantity}`;
                  return (
                    <div key={itemKey} className="rounded-3xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.category || 'Marketplace item'}</p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white">EGP {(item.price * quantity).toLocaleString()}</p>
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Qty: {quantity} • Unit: {item.unit || 'unit'}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Shipping</p>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter shipping address or delivery notes"
                    className="mt-3 w-full min-h-[120px] rounded-3xl border border-slate-200 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
                  />
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Optional but helpful for order fulfillment.</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Payment method</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Credit / Debit Card</p>
                </div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Total due</p>
                  <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">EGP {totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isSubmitting || cart.length === 0}
                className="mt-6 w-full rounded-3xl bg-emerald-600 text-white py-4 font-black uppercase tracking-widest transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing payment...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>

          {success && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3">
              <LuCheck size={20} /> {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
