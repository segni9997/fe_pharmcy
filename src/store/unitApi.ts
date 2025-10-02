import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Unit {
    id: string;
  code: string;
  name: string;
}

interface PaginatedUnitsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Unit[];
}

export const unitApi = createApi({
  reducerPath: "unitApi",
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
    getUnits: builder.query<PaginatedUnitsResponse, void>({
      query: () => ({
        url: "/pharmacy/departments/",
        method: "GET",
      }),
    }),
    getUnitByCode: builder.query<Unit, string>({
      query: (code) => ({
        url: `/pharmacy/departments/${code}/`,
        method: "GET",
      }),
    }),
    createUnit: builder.mutation<Unit, Partial<Unit>>({
      query: (body) => ({
        url: "/pharmacy/departments/",
        method: "POST",
        body,
      }),
    }),
    updateUnit: builder.mutation<Unit, Unit>({
      query: ({ id, ...rest}) => ({
        url: `/pharmacy/departments/${id}/`,
        method: "PUT",
        body: rest,
      }),
    }),
    deleteUnit: builder.mutation<void, string>({
      query: (code) => ({
        url: `/pharmacy/departments/${code}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetUnitByCodeQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi as typeof unitApi;
