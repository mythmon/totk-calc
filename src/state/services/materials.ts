import type { MaterialsRes } from "@/app/api/materials/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const materialsApi = createApi({
  reducerPath: "materialsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Materials"],
  endpoints: (builder) => ({
    getMaterials: builder.query<MaterialsRes, void>({
      query: () => "materials",
      providesTags: ["Materials"],
    }),
  }),
});

export const { useGetMaterialsQuery } = materialsApi;
