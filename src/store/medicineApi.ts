import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Medicine {
  id: string;
  is_out_of_stock: boolean;
  is_expired: boolean;
  is_nearly_expired: boolean;
  code_no: string;
  brand_name: string;
  generic_name: string;
  batch_no: string;
  manufacture_date: string; // ISO date string
  expire_date: string; // ISO date string
  price: string; // string to keep consistent with user input, e.g. "10.50"
  stock: number;
  low_stock_threshold: number;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  department: string;
  created_by: string;
}

interface PaginatedMedicinesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Medicine[];
}

export const medicineApi = createApi({
  reducerPath: "medicineApi",
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
    getMedicines: builder.query<PaginatedMedicinesResponse, void>({
      query: () => ({
        url: `/pharmacy/medicines/`,
        method: "GET",
      }),
    }),
    getMedicineByCode: builder.query<Medicine, string>({
      query: (code_no) => ({
        url: `/pharmacy/medicines/${code_no}/`,
        method: "GET",
      }),
    }),
    createMedicine: builder.mutation<Medicine, Partial<Medicine>>({
      query: (body) => ({
        url: "/pharmacy/medicines/",
        method: "POST",
        body,
      }),
    }),
    updateMedicine: builder.mutation<
      Medicine,
      Partial<Medicine>
    >({
      query: ({id, ...rest}) => ({
        url: `/pharmacy/medicines/${id}/`,
        method: "PUT",
        body:rest,
      }),
    }),
    deleteMedicine: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pharmacy/medicines/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByCodeQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi as typeof medicineApi;
