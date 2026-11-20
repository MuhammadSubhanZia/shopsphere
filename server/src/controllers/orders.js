import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/parseId.js';
import { canCancel } from '../utils/orderStatus.js';
import { placeOrder, changeStatus } from '../services/orders.js';

// GET /api/orders/mine  – the logged-in customer's orders, newest first
export const listMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ userId: req.user.id }).sort({ createdAt: -1, id: -1 }));
});

// GET /api/orders  (admin) – every order
export const listAllOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find().sort({ createdAt: -1, id: -1 }));
});

// POST /api/orders  – checkout
export const createOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.user, req.body);
  res.status(201).json(order);
});

// PATCH /api/orders/:id/status  (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  res.json(await changeStatus(parseId(req.params.id, 'Order'), req.body.status));
});

// POST /api/orders/:id/cancel  – customers can cancel their own order until it is shipped
export const cancelOrder = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Order');
  const order = await Order.findOne({ id, userId: req.user.id }); // someone else's order looks like "not found"
  if (!order) throw new ApiError('Order not found', 404);
  if (!canCancel(order.status)) throw new ApiError('This order can no longer be cancelled', 409);

  res.json(await changeStatus(id, 'cancelled'));
});
