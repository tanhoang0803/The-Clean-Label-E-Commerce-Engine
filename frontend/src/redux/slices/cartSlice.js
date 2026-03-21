import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addItem(state, action) {
      const incoming = action.payload; // { product_id, name, price, quantity, image_url }
      const existing = state.items.find((i) => i.product_id === incoming.product_id);
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        state.items.push(incoming);
      }
      saveCart(state.items);
    },
    removeItem(state, action) {
      // payload: product_id
      state.items = state.items.filter((i) => i.product_id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity(state, action) {
      // payload: { product_id, quantity }
      const { product_id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.product_id !== product_id);
      } else {
        const item = state.items.find((i) => i.product_id === product_id);
        if (item) item.quantity = quantity;
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
