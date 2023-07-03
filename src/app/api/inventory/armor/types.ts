import { z } from "zod";
import { ArmorField } from "@/lib/userInventory";
import { znt } from "@/lib/znt";

export const InventoryArmorRes = znt(
  z.object({
    armor: z.record(z.string(), z.nullable(ArmorField)),
  })
);

export type InventoryArmorRes = z.infer<typeof InventoryArmorRes>;
