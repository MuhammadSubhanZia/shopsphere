import { createSlice, nanoid } from '@reduxjs/toolkit';

// Global UI state: the toast notifications shown in the bottom-right corner.
const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      // `prepare` lets the action creator accept (message, type) and add a unique id.
      prepare(message, type = 'success') {
        return { payload: { id: nanoid(), message, type } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { showToast, dismissToast } = uiSlice.actions;
export default uiSlice.reducer;

export const selectToasts = (state) => state.ui.toasts;
