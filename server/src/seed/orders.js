import { products } from './products.js';
import { seedUsers } from './users.js';
import { calculateTotals } from '../utils/pricing.js';
import { ORDER_FLOW } from '../utils/orderStatus.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Builds a realistic historical order. Dates are relative to "now" so the demo always looks fresh.
function buildOrder({ id, userId, lines, status, daysAgo, paymentMethod, promoCode = null }) {
  const user = seedUsers.find((u) => u.id === userId);
  const items = lines.map(([productId, quantity]) => {
    const p = products.find((x) => x.id === productId);
    return { productId, name: p.name, price: p.price, quantity, category: p.category, icon: p.icon, tint: p.tint };
  });
  const totals = calculateTotals(items, promoCode);
  const createdAt = new Date(Date.now() - daysAgo * DAY_MS);
  const steps = status === 'cancelled' ? ['pending', 'cancelled'] : ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(status) + 1);

  return {
    id,
    userId,
    customer: { name: user.name, email: user.email, phone: user.phone },
    items,
    shipping: { fullName: user.name, phone: user.phone, address: user.address, city: user.city, postalCode: '' },
    paymentMethod,
    cardLast4: paymentMethod === 'card' ? '4242' : null,
    promoCode,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingFee: totals.shippingFee,
    total: totals.total,
    status,
    history: steps.map((step, i) => ({ status: step, at: new Date(createdAt.getTime() + i * 0.5 * DAY_MS) })),
    createdAt,
  };
}

export const seedOrders = [
  buildOrder({ id: 1001, userId: 2, lines: [[1, 1], [3, 1]], status: 'delivered', daysAgo: 32, paymentMethod: 'card' }),
  buildOrder({ id: 1002, userId: 3, lines: [[27, 1], [28, 2]], status: 'delivered', daysAgo: 27, paymentMethod: 'cod' }),
  buildOrder({ id: 1003, userId: 2, lines: [[31, 1], [34, 1]], status: 'delivered', daysAgo: 21, paymentMethod: 'cod' }),
  buildOrder({ id: 1004, userId: 4, lines: [[19, 2], [24, 1]], status: 'shipped', daysAgo: 6, paymentMethod: 'card', promoCode: 'SAVE10' }),
  buildOrder({ id: 1005, userId: 3, lines: [[5, 1]], status: 'processing', daysAgo: 4, paymentMethod: 'card' }),
  buildOrder({ id: 1006, userId: 2, lines: [[2, 1], [30, 1]], status: 'pending', daysAgo: 2, paymentMethod: 'cod' }),
  buildOrder({ id: 1007, userId: 4, lines: [[15, 1]], status: 'cancelled', daysAgo: 12, paymentMethod: 'cod' }),
  buildOrder({ id: 1008, userId: 3, lines: [[8, 1], [10, 1], [9, 1]], status: 'shipped', daysAgo: 3, paymentMethod: 'cod' }),
];
