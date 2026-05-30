import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LuArrowLeft, 
  LuCreditCard, 
  LuCheck, 
  LuSmartphone, 
  LuLoader, 
  LuTrendingUp, 
  LuShieldCheck,
  LuShoppingCart,
  LuBanknote
} from 'react-icons/lu';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../context/LanguageContext';
import api, { paymentsAPI } from '../../API/axiosInstance';

const Payment = () => {
  const { t, isArabic } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { cart, initialized, clearCart } = useCart(user?.id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State variables
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [walletPhone, setWalletPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Confirmation Flow States
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'failed'

  // Check if we are handling a callback from Stripe/Paymob redirect
  useEffect(() => {
    const isSuccess = searchParams.get('success');
    const isCancel = searchParams.get('cancel');
    const orderId = searchParams.get('orderId');
    const gateway = searchParams.get('gateway');
    const sessionId = searchParams.get('session_id');
    const paymobTxnId = searchParams.get('id'); // Paymob uses 'id' for txn id
    const isSimulator = searchParams.get('simulator');

    if (isSuccess === 'true' && orderId) {
      handlePaymentConfirmation({
        orderId: Number(orderId),
        gateway,
        sessionId,
        paymobTxnId,
        simulator: isSimulator === 'true'
      });
    } else if (isCancel === 'true' || isSuccess === 'false') {
      setConfirmStatus('failed');
      setError(t("pay.paymentError"));
    }
  }, [searchParams]);

  // Auth & Empty Cart Guard
  useEffect(() => {
    // Skip checks if we are currently in the middle of verifying a successful redirect callback
    const isSuccessCallback = searchParams.get('success') === 'true';
    if (isSuccessCallback) return;

    if (authLoading || !initialized) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (!cart || cart.length === 0) {
      navigate('/marketplace');
    }
  }, [authLoading, initialized, user, cart, navigate, searchParams]);

  // Perform backend confirmation
  const handlePaymentConfirmation = async (data) => {
    setIsConfirming(true);
    setConfirmStatus('verifying');
    setError('');

    try {
      await paymentsAPI.confirmPayment(data);
      
      // Clear local cart storage since the order is successfully finalized
      clearCart();
      setConfirmStatus('success');
      setSuccess(t("pay.paymentSuccess"));

      // Auto redirect to order tracking after a short delay
      setTimeout(() => {
        if (user?.role === 'BUYER' || user?.role === 'AGRO_EXPERT' || !user?.role) {
          navigate('/marketplace');
        } else {
          navigate('/track-orders');
        }
      }, 4000);
    } catch (err) {
      console.error('Confirmation call failed:', err);
      setConfirmStatus('failed');
      setError(err?.response?.data?.message || t("pay.paymentError"));
    } finally {
      setIsConfirming(false);
    }
  };

  // Action: Pay / Redirect to Gateway
  const handleCheckout = async () => {
    if (isSubmitting) return;
    setError('');
    setSuccess('');

    // Field Validations
    if (!shippingAddress.trim()) {
      setError(isArabic ? 'عنوان الشحن مطلوب لتوصيل الطلب.' : 'Shipping address is required for delivery.');
      return;
    }

    if (paymentMethod === 'VODAFONE_CASH') {
      const walletRegex = /^(010|011|012|015)\d{8}$/;
      if (!walletRegex.test(walletPhone.trim())) {
        setError(t("pay.walletNumberError"));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const checkoutItems = cart.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity || item.qty,
        type: item.type || (item.marketplaceType === 'AGRI_MARKET' ? 'agri' : 'crop') || 'crop',
        ownerId: item.ownerId || item.userId,
        marketplaceType: item.marketplaceType,
      }));

      // Call Backend to generate Payment URL
      const response = await paymentsAPI.createOrder({
        items: checkoutItems,
        shippingAddress,
        paymentMethod,
        phone: paymentMethod === 'VODAFONE_CASH' ? walletPhone.trim() : null
      });

      const { checkoutUrl } = response.data;

      // Redirect user to Stripe Checkout, Paymob Iframe, or Mock Simulator URL
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error(isArabic ? 'لم يتم استلام رابط الدفع من الخادم.' : 'Payment gateway redirect link was not received.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err?.response?.data?.message || t("pay.paymentError"));
      setIsSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * (item.quantity || item.qty), 0);

  // Loading Overlay for Redirection Callback
  if (confirmStatus === 'verifying' || confirmStatus === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center space-y-6 animate-fade-in">
          {confirmStatus === 'verifying' ? (
            <>
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                <LuLoader size={40} className="text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("pay.confirming")}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isArabic 
                  ? 'برجاء عدم إغلاق أو تحديث الصفحة أثناء تأكيد معاملتك المالية.' 
                  : 'Please do not close or refresh this page while we verify your transaction status.'}
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 animate-bounce">
                <LuCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{t("pay.success")}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {success || t("pay.paymentSuccess")}
              </p>
              <div className="pt-2 text-xs text-slate-400 dark:text-slate-500">
                {isArabic 
                  ? 'جاري إعادة توجيهك إلى تتبع الطلبات خلال ثوانٍ...' 
                  : 'Redirecting you to order tracking page in a few seconds...'}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition"
        >
          <LuArrowLeft size={18} /> {t("pay.backCart")}
        </button>

        {/* Master Payment Box */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 relative overflow-hidden">
          
          {/* Subtle Decorative Gradient Backdrop */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Heading */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <LuShieldCheck className="text-emerald-500" /> {t("pay.secureCheckout")}
              </p>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{t("pay.reviewOrder")}</h1>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-5 py-3 text-emerald-600 dark:text-emerald-400 font-black text-lg">
              {t("pay.total")}: EGP {totalAmount.toLocaleString()}
            </div>
          </div>

          {/* Top Error Alert Block */}
          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/30 p-4 text-rose-700 dark:text-rose-300 text-sm font-semibold flex items-center gap-3">
              <FiAlertTriangle size={20} className="shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Layout Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            
            {/* Left side: Order Items Summary */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <LuShoppingCart size={20} className="text-slate-400" /> {t("pay.orderSummary")}
              </h2>
              
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const quantity = item.quantity || item.qty;
                  const itemKey = item.productId || item.id || `${item.title}-${quantity}`;
                  return (
                    <div 
                      key={itemKey} 
                      className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-snug">{item.title}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {t("market.category." + item.category) || item.category || t("market.title")}
                          </p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white text-sm md:text-base shrink-0">
                          EGP {(item.price * quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{t("track.quantity")}: <strong className="text-slate-800 dark:text-slate-200">{quantity}</strong></span>
                        <span>{t("market.unitPrice")}: <strong className="text-slate-800 dark:text-slate-200">EGP {item.price}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Shipping & Gateway Options */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Shipping Address Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t("pay.shipping")}
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={t("pay.shippingPlaceholder")}
                  className="w-full min-h-[100px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-950 dark:text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500">{t("pay.shippingTip")}</p>
              </div>

              {/* Payment Method Selector Grid */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  {t("pay.paymentMethod")}
                </label>
                
                <div className="grid gap-3 sm:grid-cols-1">
                  
                  {/* Method 1: Stripe Card */}
                  <div
                    onClick={() => setPaymentMethod('STRIPE')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'STRIPE'
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <LuCreditCard size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {t("pay.method.stripe")}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {isArabic ? 'بطاقة دولية عبر بوابة Stripe الآمنة' : 'Global card processing securely hosted by Stripe'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'STRIPE' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'STRIPE' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Method 2: Paymob Card */}
                  <div
                    onClick={() => setPaymentMethod('PAYMOB_CARD')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'PAYMOB_CARD'
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <LuCreditCard size={20} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {t("pay.method.paymob_card")}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {isArabic ? 'فيزا، ماستركارد، وميزة المحلية (بيموب)' : 'Visa, Mastercard, & local Meeza cards via Paymob'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'PAYMOB_CARD' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'PAYMOB_CARD' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Method 3: Vodafone Cash */}
                  <div
                    onClick={() => setPaymentMethod('VODAFONE_CASH')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'VODAFONE_CASH'
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <LuSmartphone size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {t("pay.method.vodafone")}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {isArabic ? 'فودافون كاش والمحافظ الإلكترونية بمصر' : 'Vodafone Cash & all Egyptian mobile wallets'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'VODAFONE_CASH' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'VODAFONE_CASH' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Method 4: Cash on Delivery (COD) */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <LuBanknote size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {t("pay.method.cod")}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {isArabic ? 'الدفع نقدًا عند استلام الشحنة' : 'Pay in cash upon physical delivery'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                </div>
              </div>

              {/* Mobile number field for Vodafone Cash */}
              {paymentMethod === 'VODAFONE_CASH' && (
                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl animate-fade-in">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    {t("pay.walletNumber")}
                  </label>
                  <input
                    type="tel"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    placeholder={t("pay.walletNumberPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-950 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {isArabic 
                      ? 'أدخل رقم المحفظة المسجلة لإتمام الخصم وتأكيد العملية.' 
                      : 'Provide the active wallet mobile number that will authorize the charge.'}
                  </p>
                </div>
              )}

              {/* Summary Block */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">{t("pay.totalDue")}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">EGP {totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-[200px] text-right flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1"><LuShieldCheck size={14} className="text-emerald-500" /> SSL Encrypted</span>
                  <span>3D Secure verification</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black uppercase tracking-wider transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <LuLoader className="animate-spin" size={18} />
                    {t("pay.redirecting")}
                  </>
                ) : (
                  <>
                    {t("pay.confirmPay")}
                  </>
                )}
              </button>

              {/* Developer Sandbox Mode Warning Badge (Simulation Mode indicator) */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/55 dark:border-amber-900/30 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <LuTrendingUp size={12} /> {t("pay.simulatedAlert")}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;
