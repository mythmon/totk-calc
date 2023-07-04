"use client";

import type { ComponentWithChildren } from "@/components/component";
import { Provider } from "react-redux";
import { store } from "@/state/store";

export const StoreProvider: ComponentWithChildren = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
