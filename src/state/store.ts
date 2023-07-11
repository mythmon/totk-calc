import { configureStore } from "@reduxjs/toolkit";
import { modalReducer } from "./slices/modal";
import { armorReducer } from "./slices/armor";
import { inventoryApi } from "./services/inventory";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { materialsApi } from "./services/materials";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    armor: armorReducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(inventoryApi.middleware)
      .concat(materialsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
