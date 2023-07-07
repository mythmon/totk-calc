import fs from "node:fs/promises";
import path from "node:path";

export interface Armor {
  actorName: string;
  belongingSet: string | null;
  buyPriceRupees: number | null;
  buyPricePoes: number | null;
  defenses: number[];
  enName: string;
  hasUpgrades: boolean;
  colors: string[];
  iconUrls: Record<string, string>;
  sellingPrices: number[];
  setEnName: string | null;
  slot: "head" | "upper" | "lower" | "all";
  upgrades: null | UpgradeIngredient[][];
}

export interface UpgradeIngredient {
  material: string;
  quantity: number;
}

export interface ArmorListResponse {
  armors: Armor[];
}

const DATA_DIR = path.join(process.cwd(), "public", "data");
const ARMOR_PATH = path.join(DATA_DIR, "armors.json");
export async function fetchArmorList(): Promise<ArmorListResponse> {
  let json = await fs.readFile(ARMOR_PATH, "utf-8");
  return { armors: JSON.parse(json) };
}
