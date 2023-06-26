import type { Session } from "next-auth";
import { userPrefix } from "./kv";
import { kv } from "@vercel/kv";

type InventoryAreas = "armor";

export class UserInventory {
  private prefix: string;

  constructor(user: NonNullable<Session["user"]>) {
    this.prefix = userPrefix(user);
  }

  private key(subkey: InventoryAreas | `${InventoryAreas}/${string}`): string {
    return `${this.prefix}/inventory/${subkey}`;
  }

  async setArmor(actorName: string, level: number): Promise<void> {
    await kv.hset(this.key("armor"), { [actorName]: level });
  }

  async setArmorMany(data: Record<string, number | null>): Promise<void> {
    const toRemove = Object.entries(data).filter(([_k, v]) => v === null).map(([k]) => k);
    const toSet = Object.entries(data).filter(([_k, v]) => v !== null);
    const promises = [];
    if (toRemove.length) promises.push(kv.hdel(this.key("armor"), ...toRemove));
    if (toSet.length) promises.push(kv.hset(this.key("armor"), Object.fromEntries(toSet)));
    await Promise.all(promises);
  }

  async getArmorLevel(actorName: string): Promise<null | number> {
    return await kv.hget(this.key("armor"), actorName);
  }

  async getAllArmor(): Promise<Record<string, number>> {
    return (await kv.hgetall(this.key("armor"))) ?? {};
  }
}
