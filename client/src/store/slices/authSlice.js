import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api.js';
import { loadState } from '../../services/storage.js';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await api.loginUser(credentials);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const register = createAsyncThunk('auth/register', async (details, { rejectWithValue }) => {
  try {
    return await api.registerUser(details);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

/**
 * Asks the server who is logged in (the session cookie decides). Runs when the app starts,
 * so a session that expired, or a user that was deleted, is noticed straight away.
 */
export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    return await api.getCurrentUser();
  } catch (error) {
    return rejectWithValue({ message: error.message, status: error.status });
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await api.updateUserProfile(id, changes);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadState('session', null), // shown immediately on refresh, then confirmed by restoreSession
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login and register behave the same way: on success the user is signed in.
    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || action.error.message;
        });
    });

    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload; // fresh data from the server (role or profile may have changed)
      })
      .addCase(restoreSession.rejected, (state, action) => {
        // 401 = the server no longer knows this session. Any other failure (server offline)
        // keeps the user shown so the page does not log out just because the API is down.
        if (action.payload?.status === 401) state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;

/** Ends the session on the server, then clears the user from the store. */
export const logoutUser = () => async (dispatch) => {
  try {
    await api.logoutUser();
  } catch {
    // Even if the server cannot be reached, the user is logged out locally.
  }
  dispatch(logout());
};
export default authSlice.reducer;

// ---------- Selectors ----------
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthStatus = (state) => state.auth.status;
