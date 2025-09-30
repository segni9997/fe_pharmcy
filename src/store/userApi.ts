import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface PaginatedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}   

interface CreateUserRequest {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:8000/api",
    prepareHeaders: (headers) => {
      // 🔑 Read token straight from localStorage
      const stored = localStorage.getItem("access_token");
      if (stored) {
        try {
          headers.set("Authorization", `Bearer ${stored}`);
        } catch (e) {
          console.error("Failed to parse token_access from localStorage", e);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, void>({
      query: () => ({
        url: "/accounts/users/",
        method: "GET",
      }),
    }),
    getUsersById: builder.query<User, string>({
      query: (id) => ({
        url: `/accounts/users/${id}/`,
        method: "GET",
      }),
    }),
    updateUsersById: builder.mutation<User, User>({
      query: (body) => ({
        url: `/accounts/users/${body.id}/`,
        method: "PUT",
        body: {
          username: body.username,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          role: body.role,
        }
      }),
    }),
    deleteUsersById: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounts/users/${id}/`,
        method: "DELETE",
      }),
    }),
    patchUsersById: builder.mutation<User, string>({
      query: (id) => ({
        url: `/accounts/users/`,
        method: "GET",
        body: { id },
      }),
    }),
    CreateUSer: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        url: `/accounts/register/`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useGetUsersByIdQuery , useCreateUSerMutation, usePatchUsersByIdMutation,useUpdateUsersByIdMutation, useDeleteUsersByIdMutation} = userApi;
