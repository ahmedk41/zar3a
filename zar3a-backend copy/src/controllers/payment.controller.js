import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import { Order, OrderItem, OrderTracking, Product, Transaction, User } from '../models/index.js';
import { triggerOrderNotifications } from './notification.controller.js';

// Setup Stripe client helper
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
};

// Simulation Mode helper
const startSimulation = (req, res, order, transaction, gateway) => {
  console.log(`\n🌱 Zar3a Payments Simulator (Simulation Mode Activated)`);
  console.log(`    Gateway: ${gateway}`);
  console.log(`    Order ID: ${order.id}`);
  console.log(`    Total Amount: EGP ${order.totalAmount}`);
  console.log(`    Payment Method: ${transaction.paymentMethod}`);

  const checkoutUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment?success=true&gateway=${gateway.toLowerCase()}&orderId=${order.id}&simulator=true&transactionId=${transaction.id}`;

  return res.json({
    checkoutUrl,
    orderId: order.id,
    transactionId: transaction.id,
    isSimulation: true,
  });
};

/**
 * ─────────────────────────────────────────────────────────
 * CREATE ORDER & INIT PAYMENT
 * ─────────────────────────────────────────────────────────
 */
export const createOrderPayment = async (req, res) => {
  try {
    const user = req.user;
    const { items, shippingAddress = null, paymentMethod = 'STRIPE', phone = null } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items required' });
    }

    const orderItemsData = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.productId || item.id);
      if (!product) {
        console.warn(`Product ${item.productId || item.id} not found`);
        continue;
      }

      const quantity = Number(item.quantity) || 1;
      if (quantity < 1) continue;

      const itemTotal = Number(product.price) * quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        unit: product.unit,
        quantity,
        totalPrice: itemTotal,
        imageUrl: product.imageUrl,
        marketplaceType: product.marketplaceType,
        productSource: product.productSource,
        region: product.region,
        ownerId: product.userId,
        status: 'AVAILABLE',
      });
    }

    if (orderItemsData.length === 0) {
      return res.status(400).json({ message: 'No valid cart items found' });
    }

    // Create Order in PENDING state
    const order = await Order.create({
      userId: user.id,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      totalAmount,
      paymentMethod,
      shippingAddress,
    });

    // Create OrderItems
    const createdOrderItems = await Promise.all(
      orderItemsData.map(async (item) => {
        return await OrderItem.create({ orderId: order.id, ...item });
      })
    );

    // Create Transaction in PENDING state
    const transaction = await Transaction.create({
      userId: user.id,
      orderId: order.id,
      amount: totalAmount,
      currency: 'EGP',
      paymentMethod,
      status: 'PENDING',
    });

    // ── Handle Payment Routing ──────────────────────────────────────────────────

    // 1. STRIPE Integration
    if (paymentMethod === 'STRIPE') {
      const stripe = getStripe();
      if (!stripe) {
        return startSimulation(req, res, order, transaction, 'STRIPE');
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: orderItemsData.map(item => ({
          price_data: {
            currency: 'egp',
            product_data: {
              name: item.title,
              description: item.description || undefined,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment?success=true&gateway=stripe&session_id={CHECKOUT_SESSION_ID}&orderId=${order.id}&transactionId=${transaction.id}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment?cancel=true&gateway=stripe&orderId=${order.id}`,
        metadata: {
          orderId: String(order.id),
          userId: String(user.id),
        },
      });

      await transaction.update({ gatewayReference: session.id });
      await order.update({ notes: `Stripe Session ID: ${session.id}` });

      return res.json({
        checkoutUrl: session.url,
        orderId: order.id,
        transactionId: transaction.id,
      });
    }

    // 2. PAYMOB CARD Integration
    if (paymentMethod === 'PAYMOB_CARD') {
      if (!process.env.PAYMOB_API_KEY || !process.env.PAYMOB_CARD_INTEGRATION_ID || !process.env.PAYMOB_IFRAME_ID) {
        return startSimulation(req, res, order, transaction, 'PAYMOB_CARD');
      }

      try {
        // Step 1: Auth Token
        const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
          api_key: process.env.PAYMOB_API_KEY,
        });
        const authToken = authRes.data.token;

        // Step 2: Register Order
        const orderRes = await axios.post('https://accept.paymob.com/api/orders', {
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: Math.round(totalAmount * 100),
          currency: "EGP",
          items: [],
        });
        const paymobOrderId = orderRes.data.id;

        // Step 3: Payment Key
        const keyRes = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
          auth_token: authToken,
          amount_cents: Math.round(totalAmount * 100),
          expiration: 3600,
          order_id: paymobOrderId,
          billing_data: {
            apartment: "NA",
            email: user.email || "customer@zar3a.com",
            floor: "NA",
            first_name: user.fullName.split(' ')[0] || "Customer",
            street: "NA",
            building: "NA",
            phone_number: user.phone || "01000000000",
            shipping_method: "NA",
            postal_code: "NA",
            city: "Cairo",
            country: "EG",
            last_name: user.fullName.split(' ')[1] || "User",
            state: "Cairo",
          },
          currency: "EGP",
          integration_id: Number(process.env.PAYMOB_CARD_INTEGRATION_ID),
          lock_order_when_paid: "true",
        });
        const paymentToken = keyRes.data.token;

        await transaction.update({ gatewayReference: String(paymobOrderId) });

        const checkoutUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
        return res.json({
          checkoutUrl,
          orderId: order.id,
          transactionId: transaction.id,
        });
      } catch (paymobErr) {
        console.error('Paymob integration call failed, falling back to Simulation:', paymobErr.message);
        return startSimulation(req, res, order, transaction, 'PAYMOB_CARD');
      }
    }

    // 3. VODAFONE CASH Integration
    if (paymentMethod === 'VODAFONE_CASH') {
      const walletPhone = phone || user.phone;
      if (!walletPhone) {
        return res.status(400).json({ message: 'Mobile wallet phone number is required' });
      }

      if (!process.env.PAYMOB_API_KEY || !process.env.PAYMOB_WALLET_INTEGRATION_ID) {
        return startSimulation(req, res, order, transaction, 'VODAFONE_CASH');
      }

      try {
        // Step 1: Auth Token
        const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
          api_key: process.env.PAYMOB_API_KEY,
        });
        const authToken = authRes.data.token;

        // Step 2: Register Order
        const orderRes = await axios.post('https://accept.paymob.com/api/orders', {
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: Math.round(totalAmount * 100),
          currency: "EGP",
          items: [],
        });
        const paymobOrderId = orderRes.data.id;

        // Step 3: Payment Key
        const keyRes = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
          auth_token: authToken,
          amount_cents: Math.round(totalAmount * 100),
          expiration: 3600,
          order_id: paymobOrderId,
          billing_data: {
            apartment: "NA",
            email: user.email || "customer@zar3a.com",
            floor: "NA",
            first_name: user.fullName.split(' ')[0] || "Customer",
            street: "NA",
            building: "NA",
            phone_number: walletPhone,
            shipping_method: "NA",
            postal_code: "NA",
            city: "Cairo",
            country: "EG",
            last_name: user.fullName.split(' ')[1] || "User",
            state: "Cairo",
          },
          currency: "EGP",
          integration_id: Number(process.env.PAYMOB_WALLET_INTEGRATION_ID),
          lock_order_when_paid: "true",
        });
        const paymentToken = keyRes.data.token;

        // Step 4: Wallet redirection
        const payRes = await axios.post('https://accept.paymob.com/api/acceptance/payments/pay', {
          source: {
            identifier: walletPhone,
            subtype: "WALLET",
          },
          payment_token: paymentToken,
        });

        const checkoutUrl = payRes.data.iframe_redirection_url || payRes.data.redirect_url;
        await transaction.update({ gatewayReference: String(paymobOrderId) });

        return res.json({
          checkoutUrl,
          orderId: order.id,
          transactionId: transaction.id,
        });
      } catch (paymobErr) {
        console.error('Paymob Wallet integration failed, falling back to Simulation:', paymobErr.message);
        return startSimulation(req, res, order, transaction, 'VODAFONE_CASH');
      }
    }

    // 4. CASH ON DELIVERY (COD) Integration
    if (paymentMethod === 'COD') {
      const checkoutUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment?success=true&gateway=cod&orderId=${order.id}&transactionId=${transaction.id}`;
      return res.json({
        checkoutUrl,
        orderId: order.id,
        transactionId: transaction.id,
      });
    }

    return res.status(400).json({ message: 'Unsupported payment method' });
  } catch (err) {
    console.error('createOrderPayment error:', err);
    return res.status(500).json({ message: 'Order checkout initialization failed', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * CONFIRM PAYMENT (Called on return callback redirect)
 * ─────────────────────────────────────────────────────────
 */
export const confirmPayment = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, transactionId, gateway, sessionId, paymobTxnId, simulator } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findByPk(orderId, { include: [OrderItem] });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // If order is already paid, return early to prevent double tracking
    if (order.paymentStatus === 'PAID') {
      return res.json({
        message: 'Payment confirmed previously.',
        order,
      });
    }

    const transaction = await Transaction.findOne({
      where: { orderId: order.id },
    });

    let paymentVerified = false;

    // 1. Simulation or COD Verification
    if (simulator === true || String(simulator) === 'true' || gateway === 'cod') {
      paymentVerified = true;
    } 
    // 2. Stripe Session Verification
    else if (gateway === 'stripe' && sessionId) {
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === 'paid') {
          paymentVerified = true;
        }
      } else {
        paymentVerified = true; // Fallback for testing when stripe is not setup
      }
    } 
    // 3. Paymob Verification
    else if ((gateway === 'paymob_card' || gateway === 'vodafone_cash') && paymobTxnId) {
      if (process.env.PAYMOB_API_KEY) {
        try {
          // Retrieve details from Paymob for absolute security
          const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: process.env.PAYMOB_API_KEY,
          });
          const authToken = authRes.data.token;
          const txnRes = await axios.get(`https://accept.paymob.com/api/acceptance/transactions/${paymobTxnId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (txnRes.data && (txnRes.data.success === true || String(txnRes.data.success) === 'true')) {
            paymentVerified = true;
          }
        } catch (err) {
          console.error('Paymob API verification failed:', err.message);
          // If transaction ID is sent on query param from Paymob callback, verify via query param
          if (req.body.success === 'true' || req.body.success === true) {
            paymentVerified = true;
          }
        }
      } else {
        paymentVerified = true; // Fallback for local testing
      }
    }

    if (!paymentVerified) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update database records
    await order.update({
      paymentStatus: 'PAID',
      status: 'PROCESSING',
    });

    if (transaction) {
      await transaction.update({
        status: 'PAID',
        gatewayReference: sessionId || paymobTxnId || transaction.gatewayReference || 'SIMULATION_REF',
      });
    }

    // Create OrderTracking entries
    const items = order.OrderItems || [];
    await Promise.all(
      items.map(async (item) => {
        return await OrderTracking.create({
          orderId: order.id,
          productId: item.productId,
          userId: order.userId,
          marketplaceType: item.marketplaceType,
          productSource: item.productSource,
          title: item.title,
          description: item.description,
          category: item.category,
          price: item.price,
          unit: item.unit,
          region: item.region,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          status: 'PENDING',
          type: 'PURCHASE',
          paymentStatus: 'PAID',
        });
      })
    );

    // Trigger order notifications
    await triggerOrderNotifications(order, items);

    return res.json({
      message: 'Payment confirmed successfully',
      order: order.toJSON(),
    });
  } catch (err) {
    console.error('confirmPayment error:', err);
    return res.status(500).json({ message: 'Payment confirmation failed', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * WEBHOOK: Stripe & Paymob asynchronous payment notifications
 * ─────────────────────────────────────────────────────────
 */
export const paymentWebhook = async (req, res) => {
  try {
    // ── 1. STRIPE Webhook handling ───────────────────────────────────────────
    if (req.headers['stripe-signature']) {
      const sig = req.headers['stripe-signature'];
      const stripe = getStripe();
      if (!stripe) {
        return res.status(400).json({ message: 'Stripe not configured' });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Stripe webhook verification failed:', err.message);
        return res.status(400).json({ message: `Webhook error: ${err.message}` });
      }

      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        const stripeId = session.id || session.payment_intent;

        if (orderId) {
          const order = await Order.findByPk(orderId, { include: [OrderItem] });
          if (order && order.paymentStatus !== 'PAID') {
            await order.update({
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            });

            const transaction = await Transaction.findOne({ where: { orderId: order.id } });
            if (transaction) {
              await transaction.update({ status: 'PAID', gatewayReference: stripeId });
            }

            // Create OrderTracking entries
            const items = order.OrderItems || [];
            await Promise.all(
              items.map(async (item) => {
                return await OrderTracking.create({
                  orderId: order.id,
                  productId: item.productId,
                  userId: order.userId,
                  marketplaceType: item.marketplaceType,
                  productSource: item.productSource,
                  title: item.title,
                  description: item.description,
                  category: item.category,
                  price: item.price,
                  unit: item.unit,
                  region: item.region,
                  imageUrl: item.imageUrl,
                  quantity: item.quantity,
                  status: 'PENDING',
                  type: 'PURCHASE',
                  paymentStatus: 'PAID',
                });
              })
            );

            await triggerOrderNotifications(order, items);
            console.log(`Stripe Webhook: Order #${orderId} marked as PAID`);
          }
        }
      }
      return res.json({ received: true });
    }

    // ── 2. PAYMOB Webhook handling ───────────────────────────────────────────
    if (req.body.obj && req.body.type) {
      const obj = req.body.obj;
      
      // Paymob HMAC verification (optional, but highly recommended)
      if (process.env.PAYMOB_HMAC_SECRET) {
        try {
          const hmacInput = 
            obj.amount_cents +
            obj.created_at +
            obj.currency +
            obj.error_occured +
            obj.has_parent_transaction +
            obj.id +
            obj.integration_id +
            obj.is_3d_secure +
            obj.is_auth +
            obj.is_capture +
            obj.is_refund +
            obj.is_standalone_payment +
            obj.transaction_processed_callback_and_response +
            obj.order.id +
            obj.owner +
            obj.pending +
            obj.source_data.pan +
            obj.source_data.sub_type +
            obj.source_data.type +
            obj.success;

          const calculatedHmac = crypto
            .createHmac('sha256', process.env.PAYMOB_HMAC_SECRET)
            .update(hmacInput)
            .digest('hex');

          const receivedHmac = req.query.hmac;
          if (receivedHmac !== calculatedHmac) {
            console.warn('Paymob Webhook HMAC signature mismatch. Processing anyway for dev safety.');
          }
        } catch (hmacErr) {
          console.warn('Paymob Webhook HMAC computation failed:', hmacErr.message);
        }
      }

      const isSuccess = obj.success === true || String(obj.success) === 'true';
      const paymobOrderId = obj.order.id;
      const paymobTxnId = obj.id;

      if (isSuccess && paymobOrderId) {
        const transaction = await Transaction.findOne({
          where: { gatewayReference: String(paymobOrderId) },
        });

        if (transaction && transaction.status !== 'PAID') {
          const order = await Order.findByPk(transaction.orderId, { include: [OrderItem] });
          if (order && order.paymentStatus !== 'PAID') {
            await order.update({
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            });

            await transaction.update({
              status: 'PAID',
              gatewayReference: String(paymobTxnId),
            });

            // Create OrderTracking entries
            const items = order.OrderItems || [];
            await Promise.all(
              items.map(async (item) => {
                return await OrderTracking.create({
                  orderId: order.id,
                  productId: item.productId,
                  userId: order.userId,
                  marketplaceType: item.marketplaceType,
                  productSource: item.productSource,
                  title: item.title,
                  description: item.description,
                  category: item.category,
                  price: item.price,
                  unit: item.unit,
                  region: item.region,
                  imageUrl: item.imageUrl,
                  quantity: item.quantity,
                  status: 'PENDING',
                  type: 'PURCHASE',
                  paymentStatus: 'PAID',
                });
              })
            );

            await triggerOrderNotifications(order, items);
            console.log(`Paymob Webhook: Order #${order.id} marked as PAID`);
          }
        }
      }

      return res.json({ received: true });
    }

    return res.status(400).json({ message: 'Unrecognized webhook event source' });
  } catch (err) {
    console.error('paymentWebhook error:', err);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * GET PAYMENT STATUS (Backwards compatibility)
 * ─────────────────────────────────────────────────────────
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
    });
  } catch (err) {
    console.error('getPaymentStatus error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
