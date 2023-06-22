import { NextResponse } from "next/server";
import { loadWorkbook } from "@/data/totkDb";
import type { CellValue } from "exceljs";

export interface Armor {
  actorname: string;
  euen_name: string;
  belonging_set: string;
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

export async function GET(): Promise<Response> {
  console.log("armor GET 1", Date.now() % 10_000);
  const workbook = await loadWorkbook();

  console.log("armor GET 2", Date.now() % 10_000);
  const armorSheet = workbook.getWorksheet("Armors");
  const headers = (armorSheet.getRow(1).values as Array<string>)?.map((s) => ({
    original: s,
    slug: fieldName(s),
  }));

  const armors: unknown[] = [];
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
    if (!unusedArmors.has(item.actorname)) {
      armors.push(item);
    }
  });

  console.log("armor GET 3", Date.now() % 10_000);
  const fields = Object.fromEntries(
    Object.values(headers).map((d) => [d.slug, { title: d.original }])
  );
  delete fields["icon"];

  console.log("armor GET 4", Date.now() % 10_000);
  return NextResponse.json({ armors, fields });
}

function fieldName(s: string): string {
  let slug = sluggify(s);
  if (slug === "base_defense") return "defense_0";
  if (slug === "base_selling_price") return "selling_price_0";
  return slug;
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
