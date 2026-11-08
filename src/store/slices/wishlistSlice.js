import { createSlice } from '@reduxjs/toolkit';
import { loadState } from '../../services/storage.js';

// The wishlist only stores product ids; pages look the products up in the catalogue.
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { ids: loadState('wishlist', []) },
  reducers: {
    toggleWishlist(state, action) {
      const id = action.payload;
      state.ids = state.ids.includes(id) ? state.ids.filter((x) => x !== id) : [...state.ids, id];
    },
    removeFromWishlist(state, action) {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    clearWishlist(state) {
      state.ids = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

// ---------- Selectors ----------
export const selectWishlistIds = (state) => state.wishlist.ids;
export const selectWishlistCount = (state) => state.wishlist.ids.length;
export const selectIsWishlisted = (id) => (state) => state.wishlist.ids.includes(id);
