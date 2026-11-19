import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/mockApi.js';
import { logout } from './authSlice.js';

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (userId, { rejectWithValue }) => {
  try {
    return await api.getOrdersByUser(userId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await api.getAllOrders();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const placeOrder = createAsyncThunk('orders/place', async (payload, { rejectWithValue }) => {
  try {
    return await api.createOrder(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const changeOrderStatus = createAsyncThunk('orders/changeStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    return await api.updateOrderStatus(id, status);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const cancelMyOrder = createAsyncThunk('orders/cancel', async ({ id, userId }, { rejectWithValue }) => {
  try {
    return await api.cancelOrder(id, userId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = { items: [], status: 'idle', error: null };

const replaceOrder = (state, action) => {
  const index = state.items.findIndex((order) => order.id === action.payload.id);
  if (index !== -1) state.items[index] = action.payload;
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // The same list holds "my orders" (customers) or "all orders" (admin) depending on the page.
    [fetchMyOrders, fetchAllOrders].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || action.error.message;
        });
    });

    builder
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(changeOrderStatus.fulfilled, replaceOrder)
      .addCase(cancelMyOrder.fulfilled, replaceOrder)
      // Forget the previous user's orders when someone logs out.
      .addCase(logout, () => initialState);
  },
});

export default ordersSlice.reducer;

// ---------- Selectors ----------
export const selectOrders = (state) => state.orders.items;
export const selectOrdersStatus = (state) => state.orders.status;
export const selectOrderById = (id) => (state) => state.orders.items.find((order) => order.id === Number(id));
