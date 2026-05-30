import Stripe from 'stripe';
import { Order } from '../models/index.js';

const requireStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(key);
};

const getStripe = () => {
  try {
    return requireStripe();
  } catch (err) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your backend environment.');
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * CREATE PAYMENT INTENT
 * ─────────────────────────────────────────────────────────
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const user = req.user;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify user owns the order
    if (order.userId !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create Stripe payment intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'egp', // Egyptian Pound
      description: `Order #${order.id} from Zar3a`,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
    });
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    return res.status(500).json({ message: 'Payment processing error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * CONFIRM PAYMENT (Called after Stripe success)
 * ─────────────────────────────────────────────────────────
 */
export const confirmPayment = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ message: 'orderId and paymentIntentId required' });
    }

    const stripe = getStripe();
    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        message: 'Payment not confirmed',
        paymentStatus: paymentIntent.status,
      });
    }

    // Update order in database
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mark payment as successful
    await order.update({
      paymentStatus: 'PAID',
      status: 'PROCESSING', // Move to processing after successful payment
    });

    return res.json({
      message: 'Payment confirmed successfully',
      order: order.toJSON(),
    });
  } catch (err) {
    console.error('confirmPayment error:', err);
    return res.status(500).json({ message: 'Payment confirmation error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * WEBHOOK: Stripe sends payment updates
 * ─────────────────────────────────────────────────────────
 */
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const body = req.rawBody; // Express must pass raw body for Stripe webhook

    if (!sig) {
      return res.status(400).json({ message: 'No Stripe signature found' });
    }

    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ message: 'Webhook signature verification failed' });
    }

    // Handle payment_intent events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await Order.findByPk(orderId);
        if (order) {
          await order.update({
            paymentStatus: 'PAID',
            status: 'PROCESSING',
          });
          console.log(`Order #${orderId} payment confirmed`);
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await Order.findByPk(orderId);
        if (order) {
          await order.update({
            paymentStatus: 'FAILED',
            status: 'FAILED',
          });
          console.log(`Order #${orderId} payment failed`);
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('stripeWebhook error:', err);
    return res.status(500).json({ message: 'Webhook processing error' });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * GET PAYMENT STATUS
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
