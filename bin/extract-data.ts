import fs from "node:fs/promises";
import path from "node:path";
import { loadArmorData } from "./shared/totkDb";

const OUTPUT = path.join(process.cwd(), "public", "data", "armors.json");

const UNUSED_ARMORS = new Set([
  "Armor_1036_Lower",
  "Armor_1036_Upper",
  "Armor_1152_Head",
]);

async function main() {
  await fs.mkdir("./public/data", { recursive: true });
  console.log("loading spreadsheet");
  const armors = (await loadArmorData()).filter(
    (armor) => !UNUSED_ARMORS.has(armor.actorName)
  );
  console.log("writing data");
  await fs.writeFile(OUTPUT, JSON.stringify(armors, null, 2));
  console.log("done");
}

main().catch((e) => console.error(e));
