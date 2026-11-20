import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { nextId } from '../utils/sequence.js';
import { calculateTotals, normalizePromo } from '../utils/pricing.js';
import { str } from '../validators/common.js';

// Business logic for orders. Controllers stay thin and call these functions.
//
// MongoDB transactions need a replica set, which a plain local install does not have, so stock is
// reserved with single atomic updates ("decrease stock only if enough is left") and put back
// if a later step fails.

/** Puts the quantities of an order back into stock. */
export async function releaseStock(lines) {
  await Promise.all(lines.map((line) => Product.updateOne({ id: line.productId }, { $inc: { stock: line.quantity } })));
}

/**
 * Creates an order for `user`.
 * Everything that matters (prices, stock, totals, promo discount) is decided here, from the
 * database, never from numbers sent by the browser.
 */
export async function placeOrder(user, payload) {
  // 1. Merge repeated products so [{id:1,qty:1},{id:1,qty:2}] becomes qty 3.
  const wanted = new Map();
  payload.items.forEach(({ productId, quantity }) => wanted.set(productId, (wanted.get(productId) || 0) + quantity));

  // 2. Look every product up and check it exists and has enough stock.
  const products = await Product.find({ id: { $in: [...wanted.keys()] } });
  const lines = [...wanted].map(([productId, quantity]) => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new ApiError('A product in your cart is no longer available', 404);
    if (product.stock < quantity) {
      throw new ApiError(
        product.stock === 0 ? `"${product.name}" is out of stock` : `Only ${product.stock} of "${product.name}" left in stock`,
        409
      );
    }
    return { productId, name: product.name, price: product.price, quantity, category: product.category, icon: product.icon, tint: product.tint };
  });

  // 3. Reserve the stock. Each update only succeeds while enough units remain, so two shoppers
  //    buying the last item at the same moment cannot both get it.
  const reserved = [];
  for (const line of lines) {
    const updated = await Product.findOneAndUpdate({ id: line.productId, stock: { $gte: line.quantity } }, { $inc: { stock: -line.quantity } });
    if (!updated) {
      await releaseStock(reserved); // undo what was already taken
      throw new ApiError(`"${line.name}" just sold out. Please review your cart`, 409);
    }
    reserved.push(line);
  }

  // 4. Save the order. If that fails, give the stock back.
  try {
    const totals = calculateTotals(lines, payload.promoCode);
    const now = new Date();
    return await Order.create({
      id: await nextId('orders'),
      userId: user.id,
      customer: { name: user.name, email: user.email, phone: user.phone },
      items: lines,
      shipping: {
        fullName: str(payload.shipping.fullName),
        phone: str(payload.shipping.phone),
        address: str(payload.shipping.address),
        city: str(payload.shipping.city),
        postalCode: str(payload.shipping.postalCode),
        notes: str(payload.shipping.notes),
      },
      paymentMethod: payload.paymentMethod,
      cardLast4: payload.paymentMethod === 'card' ? str(payload.cardLast4) : null,
      promoCode: payload.promoCode ? normalizePromo(payload.promoCode) : null,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingFee: totals.shippingFee,
      total: totals.total,
      status: 'pending',
      history: [{ status: 'pending', at: now }],
    });
  } catch (error) {
    await releaseStock(reserved);
    throw error;
  }
}

/** Moves an order to a new status and records it in the order's history. */
export async function changeStatus(orderId, status) {
  const order = await Order.findOne({ id: orderId });
  if (!order) throw new ApiError('Order not found', 404);
  if (order.status === 'cancelled') throw new ApiError('Cancelled orders cannot be changed', 409);
  if (order.status === status) return order;

  // The filter on the old status makes this update fail if somebody else changed the order meanwhile.
  const updated = await Order.findOneAndUpdate(
    { id: orderId, status: order.status },
    { $set: { status }, $push: { history: { status, at: new Date() } } },
    { new: true }
  );
  if (!updated) throw new ApiError('This order was just updated by someone else. Refresh and try again', 409);

  if (status === 'cancelled') await releaseStock(updated.items);
  return updated;
}
