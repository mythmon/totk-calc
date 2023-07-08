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

    patchArmorInventory: builder.mutation<
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
      onQueryStarted: async (props, { dispatch, queryFulfilled }) => {
        const optimistic = dispatch(
          totkApi.util.updateQueryData(
            "getArmorInventory",
            undefined,
            (draft) => {
              draft.armor[props.actorName] = {
                level: props.level,
                dye: props.dye,
              };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            totkApi.util.updateQueryData(
              "getArmorInventory",
              undefined,
              () => data
            )
          );
        } catch {
          optimistic.undo();
        }
      },
    }),

    removeArmorInventory: builder.mutation<
      InventoryArmorRes,
      Armor["actorName"]
    >({
      query: (actorName) => ({
        url: `inventory/armor`,
        method: "PATCH",
        body: { armor: { [actorName]: null } } satisfies InventoryArmorRes,
      }),
      onQueryStarted: async (actorName, { dispatch, queryFulfilled }) => {
        const optimistic = dispatch(
          totkApi.util.updateQueryData(
            "getArmorInventory",
            undefined,
            (draft) => {
              delete draft.armor[actorName];
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            totkApi.util.updateQueryData(
              "getArmorInventory",
              undefined,
              () => data
            )
          );
        } catch {
          optimistic.undo();
        }
      },
    }),
  }),
});

export const {
  useGetArmorInventoryQuery,
  usePatchArmorInventoryMutation,
  useRemoveArmorInventoryMutation,
} = totkApi;
