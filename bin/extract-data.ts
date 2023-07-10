import fs from "node:fs/promises";
import path from "node:path";
import { loadArmorData, loadMaterialData } from "./shared/totkDb";

const OUTPUT = path.join(process.cwd(), "public", "data");

const UNUSED_ARMORS = new Set([
  "Armor_1036_Lower",
  "Armor_1036_Upper",
  "Armor_1152_Head",
]);

async function main() {
  await fs.mkdir(OUTPUT, { recursive: true });
  console.log("loading data");
  const armors = (await loadArmorData()).filter(
    (armor) => !UNUSED_ARMORS.has(armor.actorName)
  );
  await fs.writeFile(
    path.join(OUTPUT, "armors.json"),
    JSON.stringify(armors, null, 2)
  );

  const materials = await loadMaterialData();
  await fs.writeFile(
    path.join(OUTPUT, "materials.json"),
    JSON.stringify(materials, null, 2)
  );

  console.log("done");
}

main().catch((e) => console.error(e));
