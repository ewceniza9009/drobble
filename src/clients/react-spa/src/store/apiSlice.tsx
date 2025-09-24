// ---- File: src/store/apiSlice.tsx ----
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

interface Product {
  imageUrl: string;
  id: string;
  name: string;
  description: string;
  price: number;
}
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

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

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
interface AverageRating {
  averageRating: number;
  reviewCount: number;
}
type PaginatedReviews = { items: Review[]; totalCount: number };
type CreateReviewArg = { productId: string; rating: number; comment?: string };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5015/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'Review'], // Define a tag for caching orders
  endpoints: (builder) => ({
    getProducts: builder.query<
      PaginatedResponse<Product>,
      { page: number; pageSize: number }
    >({
      query: ({ page, pageSize }) =>
        `/products?page=${page}&pageSize=${pageSize}`,
    }),
    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
    }),
    // New endpoint to fetch a single order
    getOrderById: builder.query<Order, string>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    searchProducts: builder.query<SearchResult[], string>({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
    }),
    getReviewsByProduct: builder.query<PaginatedReviews, { productId: string; page?: number }>({
        query: ({ productId, page = 1 }) => `reviews/product/${productId}?page=${page}`,
        providesTags: (_result, _error, arg) => [{ type: 'Review', id: arg.productId }],
    }),
    getAverageRating: builder.query<AverageRating, string>({
        query: (productId) => `reviews/product/${productId}/average-rating`,
        providesTags: (_result, _error, productId) => [{ type: 'Review', id: productId }],
    }),
    createReview: builder.mutation<void, CreateReviewArg>({
        query: (body) => ({ 
            url: `reviews`,
            method: 'POST',
            body: body, 
        }),
        invalidatesTags: (_result, _error, arg) => [{ type: 'Review', id: arg.productId }],
    }),
  }),
});

export const { 
    useGetProductsQuery, 
    useGetProductByIdQuery, 
    useGetOrderByIdQuery, 
    useSearchProductsQuery,
    useGetReviewsByProductQuery,
    useGetAverageRatingQuery,
    useCreateReviewMutation,
} = apiSlice;
