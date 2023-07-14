import { configureStore } from "@reduxjs/toolkit";
import { modalReducer } from "./slices/modal";
import { armorReducer } from "./slices/armor";
import { inventoryApi } from "./services/inventory";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { staticApi } from "./services/static";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    armor: armorReducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [staticApi.reducerPath]: staticApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(inventoryApi.middleware)
      .concat(staticApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
