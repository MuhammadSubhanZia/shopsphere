import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/mockApi.js';

// Each thunk wraps one async API call. On failure the error message is passed
// to the reducer through rejectWithValue so the UI can display it.
export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await api.getProducts();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addProduct = createAsyncThunk('products/add', async (data, { rejectWithValue }) => {
  try {
    return await api.createProduct(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const editProduct = createAsyncThunk('products/edit', async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await api.updateProduct(id, changes);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeProduct = createAsyncThunk('products/remove', async (id, { rejectWithValue }) => {
  try {
    return await api.deleteProduct(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        // Only show the spinner on the first load, later refreshes happen silently.
        if (state.status !== 'succeeded') state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export default productsSlice.reducer;

// ---------- Selectors ----------
export const selectAllProducts = (state) => state.products.items;
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;
export const selectProductById = (id) => (state) => state.products.items.find((p) => p.id === Number(id));
