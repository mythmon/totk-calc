import { configureStore } from "@reduxjs/toolkit";
import { modalReducer } from "./slices/modal";
import { armorReducer } from "./slices/armor";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    armor: armorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
