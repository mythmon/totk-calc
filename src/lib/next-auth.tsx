"use client";

import type { ComponentWithChildren } from "@/components/component";
import { SessionProvider as RealSessionProvider } from "next-auth/react";

export const SessionProvider: ComponentWithChildren = ({ children }) => (
  <RealSessionProvider>{children}</RealSessionProvider>
);
