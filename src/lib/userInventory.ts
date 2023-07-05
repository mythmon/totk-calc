import "server-only";

import { userPrefix } from "./kv";
import { kv } from "@vercel/kv";
import type { User } from "./auth";
import { z } from "zod";
import { zu } from "zod_utilz";
import { ResultAsync, ok, Result } from "neverthrow";
import { znt } from "./znt";

type InventoryAreas = "armor";

const ArmorFieldV1 = znt(z.number());
const ArmorFieldV2Inner = z.object({ level: z.number(), dye: z.string() });
const ArmorFieldV2 = znt(
  z.union([zu.stringToJSON(), z.record(z.any())]).pipe(ArmorFieldV2Inner)
);

export const ArmorField = ArmorFieldV2Inner;
export type ArmorField = z.infer<typeof ArmorField>;

function parseAmorField(data: unknown): Result<ArmorField | null, Error> {
  if (data === null) return ok(null);
  return ArmorFieldV2.parseNt(data).orElse(() =>
    ArmorFieldV1.parseNt(data).map((level) => ({ level, dye: "Base" }))
  );
}

export class UserInventory {
  private prefix: string;

  constructor(user: User) {
    this.prefix = userPrefix(user);
  }

  private key(subkey: InventoryAreas | `${InventoryAreas}/${string}`): string {
    return `${this.prefix}/inventory/${subkey}`;
  }

  setArmor(actorName: string, data: ArmorField): ResultAsync<undefined, Error> {
    return ResultAsync.fromPromise(
      kv.hset(this.key("armor"), { [actorName]: JSON.stringify(data) }),
      (x) => x as Error
    ).map(() => undefined);
  }

  setArmorMany(
    data: Record<string, ArmorField | null>
  ): ResultAsync<void, Error> {
    const toRemove = Object.entries(data)
      .filter(([_k, v]) => v === null)
      .map(([k]) => k);
    const toSet = Object.entries(data)
      .filter(([_k, v]) => v !== null)
      .map(([k, v]) => [k, JSON.stringify(v)]);

    const steps = [];

    if (toRemove.length) {
      steps.push(
        ResultAsync.fromPromise(
          kv.hdel(this.key("armor"), ...toRemove),
          (x) => x as Error
        )
      );
    }

    if (toSet.length) {
      steps.push(
        ResultAsync.fromPromise(
          kv.hset(this.key("armor"), Object.fromEntries(toSet)),
          (e) => e as Error
        )
      );
    }

    return ResultAsync.combine(steps).map(() => undefined);
  }

  getArmorLevel(actorName: string): ResultAsync<ArmorField | null, Error> {
    return ResultAsync.fromPromise(
      kv.hget(this.key("armor"), actorName),
      (e) => e as Error
    ).andThen(parseAmorField);
  }

  getAllArmor(): ResultAsync<Record<string, ArmorField>, Error> {
    return ResultAsync.fromPromise(
      kv.hgetall(this.key("armor")),
      (e) => e as Error
    ).map<Record<string, ArmorField>>((records) =>
      Object.fromEntries(
        Object.entries(records ?? {})
          .map(([k, v]) => [k, parseAmorField(v)])
          .filter(([_k, v]) => v !== null)
      )
    );
  }
}
