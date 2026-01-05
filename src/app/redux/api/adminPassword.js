// src/features/api/adminApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  "https://3rad5w8lhe.execute-api.eu-north-1.amazonaws.com/api/admin";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    // Admin Login
    loginAdmin: builder.mutation({
      query: (password) => ({
        url: "/login",
        method: "POST",
        body: { password },
      }),
    }),

    // Change Admin Password
    changeAdminPassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/change-password",
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
    }),
  }),
});

export const { useLoginAdminMutation, useChangeAdminPasswordMutation } =
  adminApi;
