import fs from "node:fs/promises";
import { Armor, UpgradeIngredient } from "../src/lib/totkDb";
import type { Row } from "exceljs";
import path from "node:path";
import { loadWorkbook } from "./shared/totkDb";

const OUTPUT = path.join(process.cwd(), "public", "data", "armors.json");

const UNUSED_ARMORS = new Set([
  "Armor_1036_Lower",
  "Armor_1036_Upper",
  "Armor_1152_Head",
]);

const STAR = "★";

const SET_DISPLAY_NAMES: Record<string, string> = {
  Hylia: "Hylian",
  Korok: "Wild",
  Gerudo: "Desert Voe",
  Rito: "Snowquill",
  Goron: "Flamebreaker",
  Sheikah: "Stealth",
  Climb: "Climbing Gear",
  NightGlow: "Radiant",
  HyliaArmor: "Soldier's Armor",
  Power: "Barbarian",
  Diving: "Glide",
  NotSlippy: "Froggy",
  LightEmission: "Miner's",
  ChemicalFire: "Ember",
  ChemicalElectric: "Charged",
  ChemicalIce: "Frostbite",
  MagicArmor: "Mystic",
  Underground: "Depths",
  RoyalGuard: "Royal Guard",
  PhantomGanon: "Evil Spirit",
  OcarinaOfTime: "Time",
  WindWaker: "Wind",
  TwilightPrincess: "Twilight",
  SkywardSword: "Sky",
  Kishin: "Fierce Deity",
};

async function main() {
  console.log("loading spreadsheet");
  await fs.mkdir("./public/data", { recursive: true });

  const workbook = await loadWorkbook();
  const armorSheet = workbook.getWorksheet("Armors");
  const headers = armorSheet.getRow(1);

  console.log("reading armors");
  const armors: ArmorData[] = [];
  armorSheet.eachRow((row, rowNumber) => {
    if (!row.hasValues) return;
    if (rowNumber === 1) return;
    const item = new ArmorData(row, headers);
    if (!UNUSED_ARMORS.has(item.actorName)) {
      armors.push(item);
    }
  });

  console.log("writing data");
  await fs.writeFile(OUTPUT, JSON.stringify(armors, null, 2));

  console.log("done", OUTPUT);
}

class ArmorData implements Armor {
  constructor(private dataRow: Row, private headerRow: Row) {}

  private _getField(name: string): string | null {
    let targetColNum: number | null = null;
    this.headerRow.eachCell((cell, colNum) => {
      if (targetColNum) return;
      if (
        cell.value &&
        typeof cell.value === "string" &&
        cell.value.trim() === name
      ) {
        targetColNum = colNum;
      }
    });
    if (!targetColNum)
      throw new Error(
        `No column with header <<${name}>>\nValid headers: ${this.headerRow.values}`
      );
    let value = this.dataRow.getCell(targetColNum).value;
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && value.trim().length === 0) return null;
    return value.toString();
  }

  private _requireField(name: string): string {
    let value = this._getField(name);
    if (!value)
      throw new Error(`Cell for column ${name} was blank in ${this.actorName}`);
    return value;
  }

  toJSON(): Armor {
    const keys: (keyof Armor)[] = [
      "actorName",
      "enName",
      "belongingSet",
      "setEnName",
      "hasUpgrades",
      "icon",
      "slot",
      "buyingPrice",
      "defenses",
      "sellingPrices",
      "upgrades",
    ];
    return Object.fromEntries(
      keys.map((key) => [key, this[key]])
    ) as unknown as Armor;
  }

  get actorName(): string {
    return this._requireField("ActorName");
  }

  get belongingSet(): string | null {
    return this._getField("Belonging Set");
  }

  get buyingPrice(): number {
    return +this._requireField("Buying Price");
  }

  get defenses(): number[] {
    const defenses = [+(this._getField("Base Defense") ?? 0)];
    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const d = this._getField(`Defense ${stars}`);
      if (d !== null) defenses.push(+d);
    }
    return defenses;
  }

  get enName(): string {
    return this._requireField("EUen name");
  }

  get hasUpgrades(): boolean {
    return this.upgrades !== null && this.upgrades.length > 0;
  }

  get icon(): string {
    return `/images/armor/${this.actorName}.avif`;
  }

  get sellingPrices(): number[] {
    const sellingPrices = [+this._requireField("Base Selling Price")];
    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const d = this._getField(`Selling Price ${stars}`);
      if (d !== null) sellingPrices.push(+d);
    }
    return sellingPrices;
  }

  get setEnName(): string | null {
    const setCode = this.belongingSet;
    if (!setCode) return null;
    return `${SET_DISPLAY_NAMES[setCode] ?? setCode} set`;
  }

  get slot(): Armor["slot"] {
    const slot = this.actorName.split("_").at(-1)?.toLowerCase();
    switch (slot) {
      case "head":
      case "upper":
      case "lower":
        return slot;
      default:
        throw new Error(`unexpected slot ${slot} from ${this.actorName}`);
    }
  }

  get upgrades(): null | UpgradeIngredient[][] {
    const upgrades = [];

    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const upgradeText = this._getField(`Upgrade ${stars}`);
      if (!upgradeText) break;
      const upgradeRows = upgradeText
        .split("\n")
        .map((l) => l.match(/(\d+)\s+(.*)/))
        .filter<RegExpExecArray>((d): d is RegExpExecArray => !!d)
        .map(
          (match) =>
            ({
              quantity: +match[1]!,
              actorName: match[2]!,
            } satisfies UpgradeIngredient)
        );
      if (!upgradeRows.length)
        throw new Error(`failed to parse upgrades: ${upgradeText}`);
      upgrades.push(upgradeRows);
    }

    if (!upgrades.length) return null;
    return upgrades;
  }
}

main().catch((e) => console.error(e));
