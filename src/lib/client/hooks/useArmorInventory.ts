import type { InventoryArmorRes } from "@/app/api/inventory/armor/types";
import { useGetPatchQuery } from "@/lib/client/hooks/react-query";
import { useUser } from "@auth0/nextjs-auth0/client";

export function useArmorInventoryQuery() {
  const session = useUser();
  return useGetPatchQuery<InventoryArmorRes>({
    endpoint: "/api/inventory/armor",
    enabled: !session.isLoading && !!session.user,
  });
}
