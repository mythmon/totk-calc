'use client';

import type { ComponentWithChildren } from "@/components/component";
import { QueryClient, QueryClientProvider as RealQueryClientProvider } from "@tanstack/react-query";

export const QueryClientProvider: ComponentWithChildren = ({ children }) => {
  const queryClient = new QueryClient();
  return <RealQueryClientProvider client={queryClient}>{children}</RealQueryClientProvider>
}
