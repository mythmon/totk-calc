import { configureStore } from "@reduxjs/toolkit";
import { modalReducer } from "./slices/modal";
import { armorReducer } from "./slices/armor";
import { totkApi } from "./services/totk";
import { setupListeners } from "@reduxjs/toolkit/dist/query";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    armor: armorReducer,
    [totkApi.reducerPath]: totkApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(totkApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
