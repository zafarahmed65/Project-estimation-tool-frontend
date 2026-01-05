import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// const API_URL = "http://localhost:6000/api/auth";
const API_URL = "https://3rad5w8lhe.execute-api.eu-north-1.amazonaws.com/api/auth";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("authToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    endpoints: (builder) => ({

        // 1️⃣ Register User
        registerUser: builder.mutation({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                body: userData,
            }),
        }),

        // 2️⃣ Verify OTP / Account Verification
        verifyOtp: builder.mutation({
            query: ({ email, verificationCode }) => ({
                url: '/verify',
                method: 'POST',
                body: { email, verificationCode },
            }),
        }),

        // 3️⃣ Login User
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),

        // 4️⃣ Resend OTP
        resendOtp: builder.mutation({
            query: ({ email }) => ({
                url: '/resend-otp',
                method: 'POST',
                body: { email },
            }),
        }),

        // 5️⃣ Validate Token
        validateToken: builder.query({
            query: () => ({
                url: '/validate-token',
                method: 'GET',
            }),
        }),

    }),
});

// Export auto-generated hooks
export const {
    useRegisterUserMutation,
    useVerifyOtpMutation,
    useLoginUserMutation,
    useResendOtpMutation,
    useValidateTokenQuery,
} = authApi;
