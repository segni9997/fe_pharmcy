import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Refill } from "@/lib/types";

export interface RefillResponse {
  id: string;
  medicine: string;
  department: string;
  medicine_name: string;
  department_name: string;
  batch_no: string;
  manufacture_date: string;
  expire_date: string;
  price: string;
  quantity: number;
  refill_date: string;
  created_by_username: string;
}
interface PaginatedRefillsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RefillResponse[];
}

export const refillApi = createApi({
  reducerPath: "refillApi",
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
    getRefills: builder.query<PaginatedRefillsResponse, void>({
      query: () => ({
        url: `/pharmacy/refills/`,
        method: "GET",
      }),
    }),
    getRefillById: builder.query<Refill, string>({
      query: (id) => ({
        url: `/pharmacy/refills/${id}/`,
        method: "GET",
      }),
    }),
    createRefill: builder.mutation<Refill, Partial<Refill>>({
      query: (body) => ({
        url: "/pharmacy/refills/",
        method: "POST",
        body,
      }),
    }),
    // updateRefill: builder.mutation<Refill, Partial<Refill>>({
    //   query: ({ id, ...rest }) => ({
    //     url: `/pharmacy/refills/${id}/`,
    //     method: "PUT",
    //     body: rest,
    //   }),
    // }),
    deleteRefill: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pharmacy/refills/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetRefillsQuery,
  useGetRefillByIdQuery,
  useCreateRefillMutation,
  // useUpdateRefillMutation,
  useDeleteRefillMutation,
} = refillApi;
