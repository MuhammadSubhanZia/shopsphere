import { createSlice, createSelector } from '@reduxjs/toolkit';
import { loadState } from '../../services/storage.js';
import { calculateTotals } from '../../utils/pricing.js';
import { fetchProducts } from './productsSlice.js';

// Cart items keep a small snapshot of the product (name, price, image info, stock)
// so the cart renders instantly. The store saves the cart to localStorage,
// so it survives a page refresh.
const initialState = loadState('cart', { items: [], promoCode: null });

const toCartItem = (product) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  category: product.category,
  price: product.price,
  stock: product.stock,
  icon: product.icon,
  tint: product.tint,
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, quantity = 1 } = action.payload;
      if (product.stock < 1) return;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.stock = product.stock;
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({ ...toCartItem(product), quantity: Math.min(quantity, product.stock) });
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.quantity = Math.max(1, Math.min(quantity, item.stock));
    },
    applyPromo(state, action) {
      state.promoCode = action.payload;
    },
    removePromo(state) {
      state.promoCode = null;
    },
    clearCart(state) {
      state.items = [];
      state.promoCode = null;
    },
  },
  extraReducers: (builder) => {
    // Every time the catalogue is (re)loaded, bring the cart in line with it:
    // prices and stock are refreshed and unavailable products are dropped.
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.items = state.items.flatMap((item) => {
        const product = action.payload.find((p) => p.id === item.id);
        if (!product || product.stock < 1) return [];
        return [
          {
            ...item,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity: Math.min(item.quantity, product.stock),
          },
        ];
      });
    });
  },
});

export const { addToCart, removeFromCart, setQuantity, applyPromo, removePromo, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// ---------- Selectors ----------
export const selectCartItems = (state) => state.cart.items;
export const selectPromoCode = (state) => state.cart.promoCode;
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotals = createSelector([selectCartItems, selectPromoCode], (items, promoCode) =>
  calculateTotals(items, promoCode)
);
