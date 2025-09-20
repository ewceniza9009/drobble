import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axios';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CartState = {
  items: [],
  status: 'idle',
};

// This is an async "thunk" that handles the API call
export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (item: { productId: string; quantity: number }) => {
    const response = await api.post('/cart/items', item);
    return response.data.items; // Assuming the API returns the updated list of items
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId: string) => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data.items;
  }
);

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await api.get('/cart');
  return response.data?.items || []; // Return items or an empty array if no cart
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for fetching cart
      .addCase(fetchCart.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state) => { state.status = 'failed'; })
      // Cases for adding items
      .addCase(addItemToCart.pending, (state) => { state.status = 'loading'; })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addItemToCart.rejected, (state) => { state.status = 'failed'; })
      // Add cases for removing items
      .addCase(removeItemFromCart.pending, (state) => { state.status = 'loading'; })
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(removeItemFromCart.rejected, (state) => { state.status = 'failed'; });
  },
});
export default cartSlice.reducer;