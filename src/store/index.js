import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice.js';
import categoriesReducer from './slices/categoriesSlice.js';
import cartReducer from './slices/cartSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import uiReducer from './slices/uiSlice.js';
import { saveState } from '../services/storage.js';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
});

// Persist the cart and wishlist whenever they change.
let lastCart = store.getState().cart;
let lastWishlist = store.getState().wishlist.ids;

store.subscribe(() => {
  const { cart, wishlist } = store.getState();

  if (cart !== lastCart) {
    lastCart = cart;
    saveState('cart', cart);
  }
  if (wishlist.ids !== lastWishlist) {
    lastWishlist = wishlist.ids;
    saveState('wishlist', wishlist.ids);
  }
});
