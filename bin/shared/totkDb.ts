import fs from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import * as excelJs from "exceljs";
import type { Workbook } from "exceljs";
import fetch from "node-fetch";
import { Armor, UpgradeIngredient } from "../../src/lib/totkDb";
import z, { RefinementCtx, ZodSchema, ZodTypeDef } from "zod";

const STAR = "★";
const XLSX_PATH = path.join(process.cwd(), "totk-db.xlsx");
const TOTK_DB_SHEET_ID =
  "2PACX-1vRqO27GX-Sq_B77XLHapGxeFm09GL6kscDqo_SoA05a7jRnOds3xBFj3tpTZ5-1yG-ASQ0FbDIaQdpb";

const SET_DISPLAY_NAMES: Record<string, string> = {
  ChemicalElectric: "Charged",
  ChemicalFire: "Ember",
  ChemicalIce: "Frostbite",
  Climb: "Climbing Gear",
  Diving: "Glide",
  EnemyMust: "Enemies",
  Gerudo: "Desert Voe",
  Goron: "Flamebreaker",
  Hylia: "Hylian",
  HyliaArmor: "Soldier's Armor",
  Kishin: "Fierce Deity",
  Korok: "Wild",
  LightEmission: "Miner's",
  MagicArmor: "Mystic",
  NightGlow: "Radiant",
  NotSlippy: "Froggy",
  OcarinaOfTime: "Time",
  OldWear: "Archaic",
  PhantomGanon: "Evil Spirit",
  Power: "Barbarian",
  Rito: "Snowquill",
  RoyalGuard: "Royal Guard",
  Sheikah: "Stealth",
  SkywardSword: "Sky",
  Tincle: "Tingle",
  TwilightPrincess: "Twilight",
  UnderGround: "Depths",
  WindWaker: "Wind",
  Zonanium: "Zonaite",
  HeadAcce: "Circlet",
  EarAcce: "Earring",
  Zelda1: "Hero's",
};

export async function loadWorkbook(): Promise<Workbook> {
  const workbook = new excelJs.Workbook();
  try {
    await workbook.xlsx.readFile(XLSX_PATH);
  } catch (error) {
    if (`${error}`.includes("File not found")) {
      const url = `https://docs.google.com/spreadsheets/d/e/${TOTK_DB_SHEET_ID}/pub?output=xlsx`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Could not download spreadsheet from ${url}:\n${await res.text()}`
        );
      }
      const buffer = await res.buffer();
      const stream = Readable.from(buffer);
      await Promise.all([
        fs.writeFile(XLSX_PATH, buffer),
        workbook.xlsx.read(stream),
      ]);
    } else {
      throw error;
    }
  }
  return workbook;
}

export async function loadArmorData(): Promise<ArmorData[]> {
  const workbook = await loadWorkbook();
  const armorSheet = workbook.getWorksheet("Armor");
  const headers = armorSheet.getRow(1);

  const armors: ArmorData[] = [];
  armorSheet.eachRow((row, rowNumber) => {
    if (!row.hasValues) return;
    if (rowNumber === 1) return;
    armors.push(new ArmorData(row, headers));
  });

  return armors;
}

function zHyphenNull<Out, Inp = unknown>(
  inner: ZodSchema<Out, ZodTypeDef, Inp>
) {
  return z.preprocess((x) => (x === "-" ? null : x), z.nullable(inner));
}

const zHyphenNumber = zHyphenNull(z.coerce.number());

export class ArmorData implements Armor {
  constructor(private dataRow: excelJs.Row, private headerRow: excelJs.Row) {}

  private _getField<T>(
    name: string,
    validator?: ZodSchema<T, ZodTypeDef, unknown>
  ): T {
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
    const cell = this.dataRow.getCell(targetColNum).value;
    if (validator) {
      try {
        return validator.parse(cell);
      } catch (err) {
        console.log(
          `Error getting field ${name} for armor ${this._getField(
            "ActorName (Base)"
          )}`
        );
        throw err;
      }
    } else {
      return cell as unknown as T;
    }
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
      "buyPriceRupees",
      "buyPricePoes",
      "defenses",
      "sellingPrices",
      "upgrades",
    ];
    return Object.fromEntries(
      keys.map((key) => [key, this[key]])
    ) as unknown as Armor;
  }

  get actorName(): string {
    return this._getField("ActorName (Base)", z.string());
  }

  get belongingSet(): string | null {
    return this._getField("Set (Internal)", z.nullable(z.string()));
  }

  get buyPriceRupees(): number | null {
    return this._getField("Buy Price (Rupees)", zHyphenNumber);
  }

  get buyPricePoes(): number | null {
    return this._getField("Buy Price (Poes)", zHyphenNumber);
  }

  get defenses(): number[] {
    const defenses = [this._getField("Defense (Base)", z.coerce.number())];
    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const d = this._getField<number | null>(
        `Defense ${stars}`,
        zHyphenNumber
      );
      if (d !== null) defenses.push(d);
    }
    return defenses;
  }

  get enName(): string {
    return this._getField("Name", z.string());
  }

  get hasUpgrades(): boolean {
    return this.upgrades !== null && this.upgrades.length > 0;
  }

  get icon(): string {
    return `/images/armor/${this.actorName}.avif`;
  }

  private IMAGE_RE = /IMAGE\("(?<url>.+)"\)/;

  private get _iconUrl(): string | null {
    const extractImage = (val: string, ctx: RefinementCtx): string => {
      const match = val.match(this.IMAGE_RE);
      if (!match) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Formula did not match expected format of `IMAGE("${url}")`>',
        });
        return z.NEVER;
      }
      return match.groups?.["url"]!;
    };

    const result = this._getField(
      "Inventory Icon",
      z.nullable(z.object({ formula: z.string().transform(extractImage) }))
    );
    return result?.formula ?? null;
  }

  hasIcon(): boolean {
    return this._iconUrl !== null;
  }

  async getIconBuffer(): Promise<ArrayBuffer | null> {
    const iconCell = this._iconUrl;
    if (iconCell) {
      const res = await fetch(iconCell);
      if (res.ok) return res.arrayBuffer();
      throw new Error(await res.text());
    }
    return null;
  }

  get sellingPrices(): number[] {
    const sellingPrices: number[] = [];
    let basePrice = this._getField("Sell Price (Base)", zHyphenNumber);
    if (basePrice) {
      sellingPrices.push(basePrice);
    } else {
      return sellingPrices;
    }
    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const d = this._getField(`Sell Price ${stars}`, zHyphenNumber);
      if (d !== null) sellingPrices.push(d);
    }
    return sellingPrices;
  }

  get setEnName(): string | null {
    const setCode = this.belongingSet;
    if (!setCode) return null;
    return `${SET_DISPLAY_NAMES[setCode] ?? setCode} set`;
  }

  get slot(): Armor["slot"] {
    const slot = this._getField("Equip Slot", z.string());
    switch (slot) {
      case "Head":
        return "head";
      case "Body":
        return "upper";
      case "Legs":
        return "lower";
      case "All":
        return "all";
      default:
        throw new Error(`unexpected slot ${slot} from ${this.actorName}`);
    }
  }

  get upgrades(): null | UpgradeIngredient[][] {
    const upgrades = [];

    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      let materials: UpgradeIngredient[] = [];
      for (let i = 1; i <= 3; i++) {
        const material = this._getField(
          `Upgrade Material ${stars} (${i})`,
          zHyphenNull(z.string())
        );
        const quantity = this._getField(
          `Upgrade Material Quantity ${stars} (${i})`,
          zHyphenNull(z.number())
        );
        if (!material || !quantity) break;
        materials.push({ material, quantity: +quantity });
      }
      if (materials.length) {
        upgrades.push(materials);
      } else {
        break;
      }
    }

    if (!upgrades.length) return null;
    return upgrades;
  }
}
