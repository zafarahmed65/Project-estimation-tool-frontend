import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://3rad5w8lhe.execute-api.eu-north-1.amazonaws.com/api/projects'

export const projectDetailApi = createApi({
    reducerPath: 'projectDetailApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    endpoints: (builder) => ({

        // 1️⃣ Create or update project
        createOrUpdateProject: builder.mutation({
            query: (projectData) => {
                const { _id } = projectData;
                const url = _id ? `/${_id}` : '/';
                const method = _id ? 'PUT' : 'POST';

                return {
                    url,
                    method,
                    body: projectData,
                };
            },
        }),

        // 2️⃣ Get all projects
        getAllProjects: builder.query({
            query: () => ({
                url: '/',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
        }),

        // 3️⃣ Get project by ID
        getProjectById: builder.query({
            query: (id) => ({
                url: `/${id}`,
                method: 'GET',
            }),
        }),

        // 🛠 Delete a project
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
        }),


    }),
});

// ✅ Export all hooks
export const {
    useCreateOrUpdateProjectMutation,
    useGetAllProjectsQuery,
    useGetProjectByIdQuery,
    useDeleteProjectMutation,

} = projectDetailApi;
