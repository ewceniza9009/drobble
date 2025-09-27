// ---- File: src/store/apiSlice.tsx ----
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

// --- INTERFACES ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
}
interface PaginatedResponse<T> { items: T[]; total: number; }
interface Order { id:string; totalAmount: number; status: string; createdAt: string; items: { productId: string; quantity: number; price: number }[]; }
interface AdminUserDto { id: string; username: string; email: string; role: string; isActive: boolean; }
interface ProductUpdateArg { id: string; name: string; description: string; price: number; stock: number; categoryId: string; imageUrl: string; }
interface ProductCreateArg { name: string; description: string; price: number; stock: number; categoryId: string; imageUrl: string; }
interface SearchProduct { id: string; name: string; description: string; price: number; imageUrl: string; }

// --- ADDED INTERFACES FOR REVIEWS ---
interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
interface CreateReviewArg {
  productId: string;
  rating: number;
  comment: string;
}
// --- END OF ADDED INTERFACES ---


export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5015/api", // Ocelot Gateway
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'Review', 'AdminUser'],
  endpoints: (builder) => ({

    // --- PUBLIC & USER ENDPOINTS ---
    getProducts: builder.query<PaginatedResponse<Product>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `/products?page=${page}&pageSize=${pageSize}`,
      providesTags: (result) => result ? [...result.items.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'LIST' }] : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getOrderById: builder.query<Order, string>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    
    searchProducts: builder.query<SearchProduct[], string>({
      query: (queryText) => `/search?q=${queryText}`,
      providesTags: (_result) => [{ type: 'Product', id: 'SEARCH' }],
    }),

    // --- ADDED REVIEW ENDPOINTS ---
    getReviewsByProduct: builder.query<PaginatedResponse<Review>, { productId: string }>({
        query: ({ productId }) => `/reviews/product/${productId}`,
        providesTags: ['Review'],
    }),
    createReview: builder.mutation<Review, CreateReviewArg>({
        query: (reviewData) => ({
            url: '/reviews',
            method: 'POST',
            body: reviewData,
        }),
        invalidatesTags: ['Review'], // Invalidate the list to refetch
    }),
    // --- END OF ADDED REVIEW ENDPOINTS ---

    // --- ADMIN ENDPOINTS ---
    getAdminUsers: builder.query<AdminUserDto[], void>({
      query: () => 'admin/users',
      providesTags: ['AdminUser'],
    }),
    updateUserStatus: builder.mutation<void, { userId: string; isActive: boolean; role: string }>({
      query: ({ userId, ...body }) => ({
        url: `admin/users/${userId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),
    createAdminProduct: builder.mutation<void, ProductCreateArg>({
        query: (product) => ({
            url: 'admin/products',
            method: 'POST',
            body: product,
        }),
        invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    
    // THIS IS THE CORRECTED MUTATION
    updateAdminProduct: builder.mutation<void, ProductUpdateArg>({
      query: (product) => ({
          url: `admin/products/${product.id}`,
          method: 'PUT',
          body: product,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Product', id: arg.id }, { type: 'Product', id: 'LIST' }],
    }),
    
    // --- VENDOR ENDPOINTS ---
    getVendorProducts: builder.query<PaginatedResponse<Product>, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) => `vendor/products?page=${page}&pageSize=${pageSize}`,
      providesTags: (result) => result ? [...result.items.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'VENDOR_LIST' }] : [{ type: 'Product', id: 'VENDOR_LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetOrderByIdQuery,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useGetVendorProductsQuery,
  useSearchProductsQuery,
  // --- EXPORT THE NEWLY CREATED HOOKS ---
  useGetReviewsByProductQuery,
  useCreateReviewMutation,
  // --- END OF EXPORTS ---
} = apiSlice;