import type { Armor } from "@/lib/server/totkDb";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "@/state/hooks";

export type ArmorState = {
  list:
    | { status: "loaded"; armors: Armor[] }
    | { status: "loading" }
    | { status: "not-loaded" }
    | { status: "error"; error: Error };
};

const initialState: ArmorState = { list: { status: "not-loaded" } };

export const armorSlice = createSlice({
  name: "armor",
  initialState: initialState as ArmorState,
  reducers: {
    setList: (state, action: PayloadAction<Armor[]>) => {
      state.list = { status: "loaded", armors: action.payload };
    },
  },
});

export const { actions: armorActions, reducer: armorReducer } = armorSlice;

export function useArmorList() {
  const armorList = useAppSelector((state) => state.armor.list);
  // todo, load if needed
  return armorList;
}
