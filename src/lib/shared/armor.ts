import { z } from "zod";
import { stringToJSON } from "@/lib/shared/zodJson";
import { ok, Result } from "neverthrow";
import { znt } from "@/lib/shared/znt";

export const UpgradeIngredient = znt(
  z.object({ material: z.string(), quantity: z.number() })
);

export type UpgradeIngredient = z.infer<typeof UpgradeIngredient>;

export const DyeColor = znt(
  z.union([
    z.literal("Base"),
    z.literal("Blue"),
    z.literal("Red"),
    z.literal("Yellow"),
    z.literal("White"),
    z.literal("Black"),
    z.literal("Purple"),
    z.literal("Green"),
    z.literal("Light Blue"),
    z.literal("Navy"),
    z.literal("Orange"),
    z.literal("Peach"),
    z.literal("Crimson"),
    z.literal("Light Yellow"),
    z.literal("Brown"),
    z.literal("Gray"),
  ])
);

export type DyeColor = z.infer<typeof DyeColor>;

export const Slot = znt(
  z.union([
    z.literal("head"),
    z.literal("upper"),
    z.literal("lower"),
    z.literal("all"),
  ])
);

export type Slot = z.infer<typeof Slot>;

export const Armor = znt(
  z.object({
    actorName: z.string(),
    belongingSet: z.nullable(z.string()),
    buyPricePoes: z.nullable(z.number()),
    buyPriceRupees: z.nullable(z.number()),
    colors: z.array(DyeColor),
    defenses: z.array(z.number()).max(5),
    enName: z.string(),
    hasUpgrades: z.boolean(),
    iconUrls: z.record(DyeColor, z.string()),
    sellingPrices: z.array(z.number()).max(5),
    setEnName: z.nullable(z.string()),
    slot: Slot,
    sortKeys: z.object({
      name: z.string(),
      bodyPart: z.string(),
      set: z.string(),
    }),
    upgrades: z.nullable(z.array(z.array(UpgradeIngredient)).length(4)),
  })
);

export type Armor = z.infer<typeof Armor>;

export interface ArmorListResponse {
  armors: Armor[];
}

const ArmorFieldV1 = znt(z.number());
const ArmorFieldV2Inner = z.object({
  level: z.number().min(0).max(4),
  dye: DyeColor,
});
const ArmorFieldV2 = znt(
  z.union([stringToJSON(), z.record(z.any())]).pipe(ArmorFieldV2Inner)
);

export const ArmorField = ArmorFieldV2Inner;
export type ArmorField = z.infer<typeof ArmorField>;

export function parseAmorField(
  data: unknown
): Result<ArmorField | null, Error> {
  if (data === null) return ok(null);
  return ArmorFieldV2.parseNt(data).orElse(() =>
    ArmorFieldV1.parseNt(data).map((level) => ({ level, dye: "Base" }))
  );
}
