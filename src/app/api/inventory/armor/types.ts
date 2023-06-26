import { z } from "zod";

export const InventoryArmorRes = z.object({
  armor: z.record(z.nullable(z.number())),
});

export type InventoryArmorRes = z.infer<typeof InventoryArmorRes>;
