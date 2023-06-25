import * as excelJs from "exceljs";
import type { Workbook } from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

export async function loadWorkbook(): Promise<Workbook> {
  const workbook = new excelJs.Workbook();
  await workbook.xlsx.readFile(path.join(process.cwd(), "totk-db.xlsx"));
  return workbook;
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

const DATA_DIR = path.join(process.cwd(), "public", "data");
const ARMOR_PATH = path.join(DATA_DIR, "armors.json");
export async function fetchArmorList(): Promise<ArmorListResponse> {
  let json = await fs.readFile(ARMOR_PATH, "utf-8");
  return JSON.parse(json);
}
