// ---- File: src/store/authSlice.ts ----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axios';

interface AuthState {
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'), // Load token from local storage on start
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ token: string }>('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// New thunk for user registration
export const registerUser = createAsyncThunk(
    'auth/register',
    async (credentials: { username: string; email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', credentials);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data?.Error || 'Registration failed');
        }
    }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.token = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Add cases for registration
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;