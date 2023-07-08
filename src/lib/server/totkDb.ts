import fs from "node:fs/promises";
import path from "node:path";
import type { ArmorListResponse } from "@/lib/shared/armor";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const ARMOR_PATH = path.join(DATA_DIR, "armors.json");
export async function fetchArmorList(): Promise<ArmorListResponse> {
  let json = await fs.readFile(ARMOR_PATH, "utf-8");
  return { armors: JSON.parse(json) };
}
