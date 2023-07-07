import { z } from "zod";
import { zu } from "zod_utilz";
import { ok, Result } from "neverthrow";
import { znt } from "@/lib/shared/znt";

const ArmorFieldV1 = znt(z.number());
const ArmorFieldV2Inner = z.object({ level: z.number(), dye: z.string() });
const ArmorFieldV2 = znt(
  z.union([zu.stringToJSON(), z.record(z.any())]).pipe(ArmorFieldV2Inner)
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
