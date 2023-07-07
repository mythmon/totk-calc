import { z } from "zod";
import { ArmorField } from "@/lib/shared/armor";
import { znt } from "@/lib/shared/znt";

export const InventoryArmorRes = znt(
  z.object({
    armor: z.record(z.string(), z.nullable(ArmorField)),
  })
);

export type InventoryArmorRes = z.infer<typeof InventoryArmorRes>;
