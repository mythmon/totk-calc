import type { InventoryArmorRes } from "@/app/api/inventory/armor/types";
import { useGetPatchQuery } from "@/lib/react-query";
import { useSession } from "next-auth/react";

export function useArmorInventoryQuery() {
  const session = useSession();
  const anonymous = session.status === "unauthenticated";

  return useGetPatchQuery<InventoryArmorRes>({
    endpoint: "/api/inventory/armor",
    enabled: !anonymous,
  });
}
