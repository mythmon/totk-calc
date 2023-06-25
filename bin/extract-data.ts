import fs from "node:fs/promises";
import { Armor } from "../src/data/totkDb";
import type { CellValue } from "exceljs";
import path from "node:path";
import { loadWorkbook } from "./shared/totkDb";

const output = path.join(process.cwd(), "public", "data", "armors.json");

const unusedArmors = new Set([
  "Armor_1036_Lower",
  "Armor_1036_Upper",
  "Armor_1152_Head",
]);

async function main() {
  await fs.mkdir("./public/data", { recursive: true });

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
    item.icon = `/images/armor/${item.actorname}.avif`;
    if (!unusedArmors.has(item.actorname)) {
      armors.push(item);
    }
  });

  const fields = Object.fromEntries(
    Object.values(headers).map((d) => [d.slug, { title: d.original }])
  ) as Record<keyof Armor, { title: string }>;

  await fs.writeFile(output, JSON.stringify({ armors, fields }));
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

main().catch((e) => console.error(e));
