import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/mockApi.js';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await api.getCategories();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addCategory = createAsyncThunk('categories/add', async (data, { rejectWithValue }) => {
  try {
    return await api.createCategory(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const editCategory = createAsyncThunk('categories/edit', async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await api.updateCategory(id, changes);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeCategory = createAsyncThunk('categories/remove', async (id, { rejectWithValue }) => {
  try {
    return await api.deleteCategory(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        if (state.status !== 'succeeded') state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;

// ---------- Selectors ----------
export const selectCategories = (state) => state.categories.items;
export const selectCategoriesStatus = (state) => state.categories.status;
export const selectCategoryBySlug = (slug) => (state) => state.categories.items.find((c) => c.slug === slug);
