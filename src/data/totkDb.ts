import type { Workbook } from "exceljs";
import * as excelJs from "exceljs";
import fs from "node:fs/promises";
import type { CellValue } from "exceljs";
import path from "node:path";

let workbook: Promise<Workbook> | null = null;

export async function loadWorkbook(): Promise<Workbook> {
  if (!workbook) {
    workbook = (async () => {
      const workbook = new excelJs.Workbook();
      await workbook.xlsx.readFile("totk-db.xlsx");
      return workbook;
    })();
  }

  return await workbook;
}

export interface Armor {
  actorname: string;
  euen_name: string;
  belonging_set: string;
  icon: string;
  buying_price: number;
  defense_0: number;
  defense_1: number;
  defense_2: number;
  defense_3: number;
  defense_4: number;
  selling_price_0: number;
  selling_price_1: number;
  selling_price_2: number;
  selling_price_3: number;
  selling_price_4: number;
  upgrade_1: string;
  upgrade_2: string;
  upgrade_3: string;
  upgrade_4: string;
  total_upgrades: string;
}

export interface ArmorListResponse {
  armors: Armor[];
  fields: Record<keyof Armor, { title: string }>;
}

const unusedArmors = new Set([
  "Armor_1036_Lower",
  "Armor_1036_Upper",
  "Armor_1152_Head",
]);

let cached: Promise<ArmorListResponse> | null = null;

export async function fetchArmorList(): Promise<ArmorListResponse> {
  if (!cached) cached = loadArmorList();
  return await cached;
}

const CACHE_DIR = path.join(".", "cache");
const CACHE_JSON_PATH = path.join(CACHE_DIR, "armor-list.json");
async function loadArmorList(): Promise<ArmorListResponse> {
  try {
    let json = await fs.readFile(CACHE_JSON_PATH, "utf-8");
    return JSON.parse(json);
  } catch (err) {
    // that's ok
  }

  const workbook = await loadWorkbook();

  const armorSheet = workbook.getWorksheet("Armors");
  const headers: { original: string; slug: keyof Armor }[] = (
    armorSheet.getRow(1).values as Array<string>
  )?.map((s) => ({
    original: s,
    slug: fieldName(s),
  }));

  const armors: Armor[] = [];
  armorSheet.eachRow((row, rowNumber) => {
    if (!row.hasValues) return;
    if (rowNumber === 1) return;
    const values = row.values as Array<CellValue>;
    const item = Object.fromEntries(
      values.flatMap((d, i) => {
        const key = headers[i]?.slug;
        if (!d || !key) return [];
        return [[key, d]];
      })
    ) as unknown as Armor;
    item.icon = `/api/armor/${item.actorname}/image.png`;
    if (!unusedArmors.has(item.actorname)) {
      armors.push(item);
    }
  });

  const fields = Object.fromEntries(
    Object.values(headers).map((d) => [d.slug, { title: d.original }])
  ) as Record<keyof Armor, { title: string }>;

  (async () => {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(CACHE_JSON_PATH, JSON.stringify({ armors, fields }));
      console.log(`saved cached armor-list to ${CACHE_JSON_PATH}`);
    } catch (err) {
      console.error("Error saving cache:", err);
    }
  })();

  return { armors, fields } as const;
}

function fieldName(s: string): keyof Armor {
  let slug = sluggify(s);
  if (slug === "base_defense") return "defense_0";
  if (slug === "base_selling_price") return "selling_price_0";
  return slug as keyof Armor;
}

function sluggify(s: string): string {
  return s
    .toLowerCase()
    .replaceAll(/([A-Z])([a-z])/g, "$1_$2")
    .replaceAll(/★+/g, (d) => d.length.toString())
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replace(/^_+/, "")
    .replace(/_$/, "");
}
