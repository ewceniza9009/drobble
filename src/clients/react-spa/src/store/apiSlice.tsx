// ---- File: src/clients/react-spa/src/store/apiSlice.tsx ----
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
  isFeatured?: boolean;
}
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}
interface Order {
  id: string;
  username: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  shippingCost: number;
  items: { productId: string; quantity: number; price: number }[];
}
interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}
interface ProductUpdateArg {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
}
interface ProductCreateArg {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
}
interface SearchProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}
interface OrderStatusUpdateArg {
  orderId: string;
  newStatus: string;
}
interface ShipOrderArg {
  orderId: string;
  trackingNumber: string;
}
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
interface CreateReviewArg {
  productId: string;
  rating: number;
  comment: string;
}
interface PendingReviewDto extends Review {}
interface ModerateReviewArg {
  reviewId: string;
  approve: boolean;
  role: 'admin' | 'vendor';
}
interface PromotionRule {
  minPurchaseAmount?: number;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  exclusiveUserIds: string[];
}
interface PromotionDto {
  id: string;
  name: string;
  description: string;
  code: string;
  promotionType: 'Code' | 'Automatic';
  discountType: 'Percentage' | 'FixedAmount';
  value: number;
  rules: PromotionRule;
  startDate: string;
  endDate?: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}
interface CartContext {
  totalAmount: number;
  productIds: string[];
  categoryIds: string[];
}
interface ValidateCodeQueryArg {
  code: string;
  context: CartContext;
}
interface ValidationResponse {
  isValid: boolean;
  discountAmount: number;
  message: string;
}
type CreatePromotionArg = Omit<PromotionDto, 'id' | 'timesUsed'>;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5015/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'Review', 'AdminUser', 'PendingReview', 'AdminOrder', 'Promotion'],
  endpoints: (builder) => ({

    // --- PUBLIC & USER ENDPOINTS ---
    getProducts: builder.query<PaginatedResponse<Product>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `/products?page=${page}&pageSize=${pageSize}`,
      providesTags: (result) => result ? [...result.items.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'LIST' }] : [{ type: 'Product', id: 'LIST' }],
    }),
    getFeaturedProducts: builder.query<Product[], void>({
        query: () => `/products?isFeatured=true&pageSize=8`,
        providesTags: ['Product'],
        transformResponse: (response: PaginatedResponse<Product>) => response.items,
    }),
    getProductsByCategory: builder.query<Product[], { categoryId: string; excludeId: string; limit?: number }>({
        query: ({ categoryId, excludeId, limit = 4 }) => `/products?categoryId=${categoryId}&exclude=${excludeId}&pageSize=${limit}`,
        providesTags: ['Product'],
        transformResponse: (response: PaginatedResponse<Product>) => response.items,
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
    getReviewsByProduct: builder.query<PaginatedResponse<Review>, { productId: string }>({
        query: ({ productId }) => `/reviews/product/${productId}`,
        providesTags: ['Review'],
    }),
    createReview: builder.mutation<Review, CreateReviewArg>({
        query: (reviewData) => ({ url: '/reviews', method: 'POST', body: reviewData }),
        invalidatesTags: ['Review'],
    }),
    cancelOrder: builder.mutation<void, string>({
        query: (orderId) => ({
            url: `orders/${orderId}/cancel`,
            method: 'POST',
        }),
        invalidatesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }, { type: 'AdminOrder', id: 'LIST' }],
    }),

    // --- ADMIN ENDPOINTS ---
    getAdminUsers: builder.query<AdminUserDto[], void>({
      query: () => 'admin/users',
      providesTags: ['AdminUser'],
    }),
    updateUserStatus: builder.mutation<void, { userId: string; isActive: boolean; role: string }>({
      query: ({ userId, ...body }) => ({ url: `admin/users/${userId}`, method: 'PUT', body }),
      invalidatesTags: ['AdminUser'],
    }),
    createAdminProduct: builder.mutation<void, ProductCreateArg>({
        query: (product) => ({ url: 'admin/products', method: 'POST', body: product }),
        invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateAdminProduct: builder.mutation<void, ProductUpdateArg>({
      query: (product) => ({ url: `admin/products/${product.id}`, method: 'PUT', body: product }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Product', id: arg.id }, { type: 'Product', id: 'LIST' }],
    }),
    getAdminPendingReviews: builder.query<PaginatedResponse<PendingReviewDto>, void>({
        query: () => 'admin/reviews/pending',
        providesTags: ['PendingReview'],
    }),
    moderateReview: builder.mutation<void, ModerateReviewArg>({
        query: ({ reviewId, approve, role }) => ({ url: `${role}/reviews/${reviewId}/moderate`, method: 'PUT', body: { reviewId, approve } }),
        invalidatesTags: ['PendingReview'],
    }),
    getAdminOrders: builder.query<PaginatedResponse<Order>, void>({
        query: () => 'admin/orders',
        providesTags: (result) => {
            return result ? [...result.items.map(({ id }) => ({ type: 'AdminOrder' as const, id })), { type: 'AdminOrder', id: 'LIST' }] : [{ type: 'AdminOrder', id: 'LIST' }]
        },
    }),
    updateOrderStatus: builder.mutation<void, OrderStatusUpdateArg>({
        query: ({ orderId, newStatus }) => ({
            url: `admin/orders/${orderId}/status`,
            method: 'PUT',
            body: { orderId, newStatus },
        }),
        invalidatesTags: (_result, _error, arg) => [{ type: 'AdminOrder', id: 'LIST' }, { type: 'Order', id: arg.orderId }],
    }),
    shipOrder: builder.mutation<void, ShipOrderArg>({
        query: ({ orderId, trackingNumber }) => ({
            url: `admin/orders/${orderId}/ship`,
            method: 'POST',
            body: { trackingNumber },
        }),
        invalidatesTags: (_result, _error, arg) => [{ type: 'AdminOrder', id: 'LIST' }, { type: 'Order', id: arg.orderId }],
    }),
    getAdminPromotions: builder.query<PromotionDto[], void>({
        query: () => 'promotions/admin',
        providesTags: (result) => result ? [...result.map(({ id }) => ({ type: 'Promotion' as const, id })), { type: 'Promotion', id: 'LIST' }] : [{ type: 'Promotion', id: 'LIST' }],
    }),
    createAdminPromotion: builder.mutation<PromotionDto, CreatePromotionArg>({
        query: (promotion) => ({
            url: 'promotions/admin',
            method: 'POST',
            body: promotion,
        }),
        invalidatesTags: [{ type: 'Promotion', id: 'LIST' }],
    }),
    validatePromoCode: builder.mutation<ValidationResponse, ValidateCodeQueryArg>({
        query: (args) => ({
            url: 'promotions/validate',
            method: 'POST',
            body: args,
        }),
    }),

    // --- VENDOR ENDPOINTS ---
    getVendorProducts: builder.query<PaginatedResponse<Product>, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) => `vendor/products?page=${page}&pageSize=${pageSize}`,
      providesTags: (result) => result ? [...result.items.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'VENDOR_LIST' }] : [{ type: 'Product', id: 'VENDOR_LIST' }],
    }),
    getVendorPendingReviews: builder.query<PaginatedResponse<PendingReviewDto>, void>({
        query: () => 'vendor/reviews/pending',
        providesTags: ['PendingReview'],
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
  useGetReviewsByProductQuery,
  useCreateReviewMutation,
  useGetAdminPendingReviewsQuery,
  useGetVendorPendingReviewsQuery,
  useModerateReviewMutation,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useGetAdminPromotionsQuery,
  useCreateAdminPromotionMutation,
  useValidatePromoCodeMutation,
} = apiSlice;