import { InventoryArmorRes } from "@/app/api/inventory/armor/types";
import { type Armor, ArmorField } from "@/lib/shared/armor";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const totkApi = createApi({
  reducerPath: "totkApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["InventoryArmor"],
  endpoints: (builder) => ({
    getArmorInventory: builder.query<InventoryArmorRes, void>({
      query: () => `inventory/armor`,
      providesTags: ["InventoryArmor"],
    }),
    addArmorToInventory: builder.mutation<
      InventoryArmorRes,
      { actorName: Armor["actorName"] } & ArmorField
    >({
      query: ({ actorName, ...armorField }) => ({
        url: `inventory/armor`,
        method: "PATCH",
        body: {
          armor: { [actorName]: armorField },
        } satisfies InventoryArmorRes,
      }),
      onQueryStarted: async (_props, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            totkApi.util.updateQueryData(
              "getArmorInventory",
              undefined,
              (draft) => {
                Object.assign(draft, data);
              }
            )
          );
        } catch {}
      },
    }),
  }),
});

export const { useGetArmorInventoryQuery, useAddArmorToInventoryMutation } =
  totkApi;