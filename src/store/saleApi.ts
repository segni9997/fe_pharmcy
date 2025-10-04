import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Sale, SaleItem } from "@/lib/types";
export interface  pagination {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
interface PaginatedSalesResponse {
  results: Sale[];
  pagination: pagination;
 
}

interface PaginatedSaleItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SaleItem[];
}

export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:8000/api",
    prepareHeaders: (headers) => {
      const stored = localStorage.getItem("access_token");
      if (stored) {
        try {
          headers.set("Authorization", `Bearer ${stored}`);
        } catch (e) {
          console.error("Failed to set authorization header", e);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSales: builder.query<PaginatedSalesResponse, { pageNumber?: number; pageSize?: number }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("pageNumber", String(params.pageNumber ?? 1));
        queryParams.append("page_size", String(params.pageSize ?? 10));
        const url = `/pharmacy/sales/?${queryParams.toString()}`;
        console.log('Fetching sales with URL:', url);
        return {
          url,
          method: "GET",
        };
      },
    }),
    getSaleById: builder.query<Sale, string>({
      query: (id) => ({
        url: `/pharmacy/sales/${id}/`,
        method: "GET",
      }),
    }),
    createSale: builder.mutation<
      Sale,
      {
        customer_name?: string;
        customer_phone?: string;
        discount_percentage: number;
        sold_by: string;
        items: {
          medicine: string;
          quantity: number;
          price: number;
        }[];
      }
    >({
      query: (body) => ({
        url: "/pharmacy/sales/",
        method: "POST",
        body,
      }),
    }),
    getSaleItems: builder.query<PaginatedSaleItemsResponse, string>({
      query: (saleId) => ({
        url: `/pharmacy/sale-items/?sale=${saleId}`,
        method: "GET",
      }),
    }),
    createSaleItem: builder.mutation<SaleItem, Partial<SaleItem>>({
      query: (body) => ({
        url: "/pharmacy/sale-items/",
        method: "POST",
        body,
      }),
    }),
  }),
  // Removed updateSale and deleteSale mutations as per user request
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useGetSaleItemsQuery,
  useCreateSaleItemMutation,
  // Removed useUpdateSaleMutation and useDeleteSaleMutation hooks as per user request
} = saleApi;
