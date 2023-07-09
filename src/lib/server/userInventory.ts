import "server-only";

import { userPrefix } from "./kv";
import { kv } from "@vercel/kv";
import type { User } from "@/lib/shared/user";
import { Result, ResultAsync } from "neverthrow";
import {
  parseAmorField as parseArmorField,
  type ArmorField,
} from "@/lib/shared/armor";

type InventoryAreas = "armor";

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
    ).andThen(parseArmorField);
  }

  getAllArmor(): ResultAsync<Record<string, ArmorField>, Error> {
    return ResultAsync.fromPromise(
      kv.hgetall(this.key("armor")),
      (e) => e as Error
    ).andThen<ResultAsync<Record<string, ArmorField>, Error>>((records) =>
      Result.combine(
        Object.entries(records ?? {}).flatMap(([k, v]) =>
          parseArmorField(v).map((parsed) =>
            parsed === null ? [] : ([k, parsed] as const)
          )
        )
      ).asyncMap(async (ds) =>
        Object.fromEntries(ds.filter(([_k, v]) => v !== null))
      )
    );
  }
}
