import { Cart } from '../models/index.js';

export const getCart = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });
    return res.status(200).json({ items: cart.items || [], totalAmount: Number(cart.totalAmount || 0) });
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCart = async (req, res) => {
  try {
    const user = req.user;
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'Items must be an array' });

    const totalAmount = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

    const [cart, created] = await Cart.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id, items, totalAmount } });
    if (!created) {
      await cart.update({ items, totalAmount });
    }

    return res.status(200).json({ items, totalAmount });
  } catch (err) {
    console.error('updateCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ where: { userId: user.id } });
    if (cart) {
      await cart.update({ items: [], totalAmount: 0 });
    }
    return res.status(200).json({ items: [], totalAmount: 0 });
  } catch (err) {
    console.error('clearCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getCart, updateCart, clearCart };
