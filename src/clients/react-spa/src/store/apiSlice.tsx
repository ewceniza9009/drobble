import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

interface Product {
  imageUrl: string; id: string; name: string; description: string; price: number; 
}
interface PaginatedResponse<T> { items: T[]; total: number; }

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
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `/products?page=${page}&pageSize=${pageSize}`,
    }),
    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = apiSlice;