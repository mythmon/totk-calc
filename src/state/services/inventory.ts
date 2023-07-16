import { InventoryArmorRes } from "@/app/api/inventory/armor/types";
import { type Armor, ArmorField } from "@/lib/shared/armor";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["InventoryArmor"],
  endpoints: (builder) => ({
    getArmorInventory: builder.query<InventoryArmorRes, void>({
      query: () => `inventory/armor`,
      providesTags: ["InventoryArmor"],
    }),

    patchOneArmorInventory: builder.mutation<
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
          inventoryApi.util.updateQueryData(
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
            inventoryApi.util.updateQueryData(
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

    patchManyArmorInventory: builder.mutation<
      InventoryArmorRes,
      { [actorName: string]: ArmorField | null }
    >({
      query: (armor) => ({
        url: `inventory/armor`,
        method: "PATCH",
        body: {
          armor,
        } satisfies InventoryArmorRes,
      }),
      onQueryStarted: async (_props, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(
          inventoryApi.util.updateQueryData(
            "getArmorInventory",
            undefined,
            () => data
          )
        );
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
          inventoryApi.util.updateQueryData(
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
            inventoryApi.util.updateQueryData(
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
  usePatchOneArmorInventoryMutation,
  usePatchManyArmorInventoryMutation,
  useRemoveArmorInventoryMutation,
} = inventoryApi;
