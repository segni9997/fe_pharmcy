import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AnalyticsData, OverviewData } from "@/lib/types";
import { API_URL } from "./authApi";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
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
    getAnalytics: builder.query<AnalyticsData, void>({
      query: () => ({
        url: "/pharmacy/dashboard/analytics/",
        method: "GET",
      }),
    }),
    getOverview: builder.query<OverviewData, void>({
      query: () => ({
        url: "/pharmacy/dashboard/overview/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetOverviewQuery,
} = dashboardApi;
