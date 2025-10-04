// ---- File: src/clients/react-spa/src/store/cartSlice.ts ----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axios';

interface CartItem {
    priceAtAdd: number;
    productId: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

interface OrderItemPayload {
    productId: string;
    quantity: number;
    price: number;
}

// Ensure this interface includes the promotion fields
interface PlaceOrderPayload {
    items: OrderItemPayload[];
    shippingAddress: {
        fullName: string;
        addressLine: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod: string;
    shippingCost: number;
    appliedPromoCode: string | null;
    discountAmount: number;
}

const initialState: CartState = {
    items: [],
    status: 'idle',
};

// Async Thunks
export const addItemToCart = createAsyncThunk(
    'cart/addItem',
    async (item: { productId: string; quantity: number }) => {
        const response = await api.post('/cart/items', item);
        return response.data.items;
    }
);

export const updateItemQuantity = createAsyncThunk(
    'cart/updateItemQuantity',
    async ({ productId, quantity }: { productId: string; quantity: number }) => {
        const response = await api.put(`/cart/items/${productId}`, { quantity });
        return response.data.items;
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
    return response.data?.items || [];
});

// Ensure this thunk sends the entire payload
export const placeOrder = createAsyncThunk(
    'cart/placeOrder',
    async (orderPayload: PlaceOrderPayload, { }) => {
        const response = await api.post('/orders', orderPayload);
        return response.data;
    }
);

export const mergeCart = createAsyncThunk('cart/mergeCart', async () => {
    const response = await api.post('/cart/merge');
    return response.data?.items || [];
});

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchCart.rejected, (state) => { state.status = 'failed'; })
            .addCase(addItemToCart.pending, (state) => { state.status = 'loading'; })
            .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(addItemToCart.rejected, (state) => { state.status = 'failed'; })
            .addCase(updateItemQuantity.pending, (state) => { state.status = 'loading'; })
            .addCase(updateItemQuantity.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(updateItemQuantity.rejected, (state) => { state.status = 'failed'; })
            .addCase(removeItemFromCart.pending, (state) => { state.status = 'loading'; })
            .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(removeItemFromCart.rejected, (state) => { state.status = 'failed'; })
            .addCase(placeOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(placeOrder.fulfilled, (state) => {
                state.status = 'succeeded';
                state.items = [];
            })
            .addCase(placeOrder.rejected, (state) => {
                state.status = 'failed';
            })
            .addCase(mergeCart.pending, (state) => { state.status = 'loading'; })
            .addCase(mergeCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(mergeCart.rejected, (state) => { state.status = 'failed'; });
    },
});

export default cartSlice.reducer;