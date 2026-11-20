import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice.js';
import categoriesReducer from './slices/categoriesSlice.js';
import cartReducer from './slices/cartSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import uiReducer from './slices/uiSlice.js';
import authReducer from './slices/authSlice.js';
import ordersReducer from './slices/ordersSlice.js';
import { saveState } from '../services/storage.js';
import { setUnauthorizedHandler } from '../services/api.js';
import { logout } from './slices/authSlice.js';
import { showToast } from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
});

// Persist the cart, wishlist and login session whenever they change.
let lastCart = store.getState().cart;
let lastWishlist = store.getState().wishlist.ids;
let lastUser = store.getState().auth.user;

store.subscribe(() => {
  const { cart, wishlist, auth } = store.getState();

  if (cart !== lastCart) {
    lastCart = cart;
    saveState('cart', cart);
  }
  if (wishlist.ids !== lastWishlist) {
    lastWishlist = wishlist.ids;
    saveState('wishlist', wishlist.ids);
  }
  if (auth.user !== lastUser) {
    lastUser = auth.user;
    saveState('session', auth.user);
  }
});

// If the server says "not logged in" while someone is signed in (the session expired),
// sign them out here too.
setUnauthorizedHandler(() => {
  if (store.getState().auth.user) {
    store.dispatch(logout());
    store.dispatch(showToast('Your session has expired. Please log in again.', 'info'));
  }
});
