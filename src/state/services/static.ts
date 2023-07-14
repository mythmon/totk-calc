import type { Armor } from "@/lib/shared/armor";
import type { Material } from "@/lib/shared/material";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

export const staticApi = createApi({
  reducerPath: "staticApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/data" }),
  tagTypes: ["Armors", "Materials"],
  endpoints: (builder) => ({
    getArmors: builder.query<Armor[], void>({
      query: () => "armors.json",
      providesTags: ["Armors"],
    }),
    getMaterials: builder.query<Material[], void>({
      query: () => "materials.json",
      providesTags: ["Materials"],
    }),
  }),
});

export const { useGetArmorsQuery, useGetMaterialsQuery } = staticApi;
