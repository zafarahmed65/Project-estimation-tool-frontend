import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = "https://3rad5w8lhe.execute-api.eu-north-1.amazonaws.com/api/dropdown-options"
// const API_URL = "http://localhost:5000/api/dropdown-options"

export const dropdownOptionsApi = createApi({
    reducerPath: 'dropdownOptionsApi',

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
    tagTypes: ['DropdownOptions'], // Add this line
    endpoints: (builder) => ({
        
        // Get dropdown options
        getDropdownOptions: builder.query({
            query: () => ({
                url: '/',
                method: 'GET',
            }),
            providesTags: ['DropdownOptions'],
        }),

        // Update dropdown options
        updateDropdownOptions: builder.mutation({
            query: (options) => ({
                url: '/',
                method: 'PUT',
                body: options,
            }),
            invalidatesTags: ['DropdownOptions'],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetDropdownOptionsQuery,
    useUpdateDropdownOptionsMutation,
} = dropdownOptionsApi;