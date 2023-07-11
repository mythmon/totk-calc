import { z } from "zod";
import { znt } from "./znt";

export const Material = znt(
  z.object({
    actorName: z.string(),
    iconUrl: z.string(),
    name: z.string(),
    sortKeys: z.object({ type: z.string(), name: z.string() }),
  })
);

export type Material = z.infer<typeof Material>;
