// ---- File: src/store/apiSlice.tsx ----
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

interface Product {
  imageUrl: string; id: string; name: string; description: string; price: number; 
}
interface PaginatedResponse<T> { items: T[]; total: number; }

// Define the Order type based on the backend DTO
interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { productId: string; quantity: number; price: number }[];
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5015/api',
    credentials: 'include', 
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
  }),
  tagTypes: ['Order'], // Define a tag for caching orders
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `/products?page=${page}&pageSize=${pageSize}`,
    }),
    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
    }),
    // New endpoint to fetch a single order
    getOrderById: builder.query<Order, string>({
        query: (orderId) => `/orders/${orderId}`,
        providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
     searchProducts: builder.query<SearchResult[], string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery, useGetOrderByIdQuery, useSearchProductsQuery } = apiSlice;