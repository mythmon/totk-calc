import fs from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import * as excelJs from "exceljs";
import type { Workbook } from "exceljs";
import fetch from "node-fetch";
import { Armor, DyeColor, UpgradeIngredient } from "@/lib/shared/armor";
import { Material } from "@/lib/shared/material";
import z, { RefinementCtx, ZodSchema, ZodTypeDef } from "zod";

const STAR = "★";
const XLSX_PATH = path.join(process.cwd(), "totk-db.xlsx");
const TOTK_DB_SHEET_ID =
  "2PACX-1vRqO27GX-Sq_B77XLHapGxeFm09GL6kscDqo_SoA05a7jRnOds3xBFj3tpTZ5-1yG-ASQ0FbDIaQdpb";

const SET_DISPLAY_NAMES: Record<string, string | null> = {
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
  AncientHeroSoul: null,
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
  const armorSheet = new SheetHelper(workbook.getWorksheet("Armor"));
  const armorIconSheet = new SheetHelper(workbook.getWorksheet("Armor Icons"));

  const armors: ArmorData[] = armorSheet
    .getRows()
    .map(
      (row) =>
        new ArmorData(
          row,
          armorIconSheet.lookup(
            "ActorName (Base)",
            row.getField("ActorName (Base)")
          )
        )
    );

  return armors;
}

export async function loadMaterialData(): Promise<MaterialData[]> {
  const workbook = await loadWorkbook();
  const materialSheet = new SheetHelper(workbook.getWorksheet("Materials"));
  return materialSheet.getRows().map((row) => new MaterialData(row));
}

class SheetHelper {
  private _headerRow: excelJs.Row;
  private _columnMap: Record<string, number>;

  constructor(private _sheet: excelJs.Worksheet) {
    this._headerRow = this._sheet.getRow(1);

    this._columnMap = {};
    this._headerRow.eachCell((cell, colNum) => {
      const res = z.string().safeParse(cell.value);
      if (res.success) {
        this._columnMap[res.data] = colNum;
      }
    });
  }

  get fieldNames(): string[] {
    return Object.keys(this._columnMap);
  }

  getCell<T>(
    rowNumber: number,
    name: string,
    validator?: ZodSchema<T, ZodTypeDef, unknown>
  ): T {
    const columnNum = this._columnMap[name];
    if (!columnNum) throw new Error(`no field named ${name} found`);
    const cell = this._sheet.getCell(rowNumber, columnNum).value;
    if (validator) {
      try {
        return validator.parse(cell);
      } catch (err) {
        console.error(`Error getting field ${name} for row ${rowNumber}`);
        console.error(cell);
        throw err;
      }
    } else {
      return cell as unknown as T;
    }
  }

  getRows(): SheetRowHelper[] {
    const rv: SheetRowHelper[] = [];
    this._sheet.eachRow((row, rowNumber) => {
      if (!row.hasValues) return;
      if (rowNumber === 1) return;
      rv.push(new SheetRowHelper(this, rowNumber));
    });
    return rv;
  }

  lookup(
    lookupColumn: string,
    lookupValue: excelJs.Cell["value"]
  ): SheetRowHelper {
    for (let rowNum = 2; rowNum <= this._sheet.rowCount; rowNum++) {
      if (this.getCell(rowNum, lookupColumn) === lookupValue) {
        return new SheetRowHelper(this, rowNum);
      }
    }
    throw new Error(
      `no row found with ${lookupColumn} = ${JSON.stringify(lookupValue)}`
    );
  }
}

class SheetRowHelper {
  constructor(private _sheetHelper: SheetHelper, private _rowNumber: number) {}

  getField<T>(name: string, validator?: ZodSchema<T, ZodTypeDef, unknown>): T {
    return this._sheetHelper.getCell(this._rowNumber, name, validator);
  }

  get fieldNames(): string[] {
    return this._sheetHelper.fieldNames;
  }
}

function zHyphenNull<Out, Inp = unknown>(
  inner: ZodSchema<Out, ZodTypeDef, Inp>
) {
  return z.preprocess((x) => (x === "-" ? null : x), z.nullable(inner));
}

const zHyphenNumber = zHyphenNull(z.coerce.number());

export class ArmorData implements Armor {
  constructor(
    private dataRow: SheetRowHelper,
    private iconRow: SheetRowHelper
  ) {}

  toJSON(): Armor {
    const keys: (keyof Armor)[] = [
      "actorName",
      "belongingSet",
      "buyPricePoes",
      "buyPriceRupees",
      "colors",
      "defenses",
      "enName",
      "hasUpgrades",
      "iconUrls",
      "sellingPrices",
      "setEnName",
      "slot",
      "sortKeys",
      "upgrades",
    ];
    return Armor.parse(Object.fromEntries(keys.map((key) => [key, this[key]])));
  }

  get actorName(): string {
    return this.dataRow.getField("ActorName (Base)", z.string());
  }

  get belongingSet(): string | null {
    return this.dataRow.getField("Set (Internal)", z.nullable(z.string()));
  }

  get buyPriceRupees(): number | null {
    return this.dataRow.getField("Buy Price (Rupees)", zHyphenNumber);
  }

  get buyPricePoes(): number | null {
    return this.dataRow.getField("Buy Price (Poes)", zHyphenNumber);
  }

  get colors(): DyeColor[] {
    return [
      "Base",
      ...this.iconRow.fieldNames
        .filter((name) => name.startsWith("Inventory Icon"))
        .map<[string, { formula: string } | null]>((name) => [
          name,
          this.iconRow.getField(name, zHyphenNull(zImageFromFormula)),
        ])
        .filter(([_name, url]) => url !== null)
        .flatMap(([name, _url]) => {
          const match = name.match(/Inventory Icon \((?<color>[^)]+)\)/);
          const color = match?.groups?.["color"];
          return DyeColor.parseNt(color).match(
            (color) => [color],
            () => []
          );
        }),
    ];
  }

  get defenses(): number[] {
    const defenses = [
      this.dataRow.getField("Defense (Base)", z.coerce.number()),
    ];
    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const d = this.dataRow.getField<number | null>(
        `Defense ${stars}`,
        zHyphenNumber
      );
      if (d !== null) defenses.push(d);
    }
    return defenses;
  }

  get enName(): string {
    return this.dataRow.getField("Name", z.string());
  }

  get hasUpgrades(): boolean {
    return this.upgrades !== null && this.upgrades.length > 0;
  }

  get iconUrls(): Record<string, string> {
    const icons: Record<string, string> = {};
    for (const color of this.colors) {
      icons[color] = `/images/armor/${this.actorName}_${color}.avif`;
    }
    return icons;
  }

  private _getIconUrl(color: string): string | null {
    let fieldName = `Inventory Icon`;
    if (color !== "Base") {
      fieldName += ` (${color})`;
    }
    const result = this.iconRow.getField(
      fieldName,
      zHyphenNull(zImageFromFormula)
    );
    return result?.formula ?? null;
  }

  hasIcon(): boolean {
    return this._getIconUrl("Base") !== null;
  }

  async getIconBuffer(color: string): Promise<ArrayBuffer | null> {
    const iconUrl = this._getIconUrl(color);
    if (iconUrl) {
      const res = await fetch(iconUrl);
      if (res.ok) return res.arrayBuffer();
      throw new Error(await res.text());
    }
    return null;
  }

  get sellingPrices(): number[] {
    const sellingPrices: number[] = [];
    let basePrice = this.dataRow.getField("Sell Price (Base)", zHyphenNumber);
    if (basePrice) {
      sellingPrices.push(basePrice);
    } else {
      return sellingPrices;
    }
    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      const d = this.dataRow.getField(`Sell Price ${stars}`, zHyphenNumber);
      if (d !== null) sellingPrices.push(d);
    }
    return sellingPrices;
  }

  get setEnName(): string | null {
    const setCode = this.belongingSet;
    if (!setCode) return null;
    const mapped = SET_DISPLAY_NAMES[setCode];
    if (mapped === null) return null;
    return `${mapped ?? setCode} set`;
  }

  get slot(): Armor["slot"] {
    const slot = this.dataRow.getField("Equip Slot", z.string());
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

  get sortKeys(): Armor["sortKeys"] {
    return {
      name: this.enName,
      bodyPart: this.dataRow
        .getField("Inventory Order (By body part)", z.number())
        .toString()
        .padStart(3, "0"),
      set: this.dataRow
        .getField("Inventory Order (By set)", z.number())
        .toString()
        .padStart(3, "0"),
    };
  }

  get upgrades(): null | UpgradeIngredient[][] {
    const upgrades = [];

    for (let stars = STAR; stars.length <= 4; stars += STAR) {
      let materials: UpgradeIngredient[] = [];
      for (let i = 1; i <= 3; i++) {
        const material = this.dataRow.getField(
          `Upgrade Material ${stars} (${i})`,
          zHyphenNull(z.string())
        );
        const quantity = this.dataRow.getField(
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

export class MaterialData implements Material {
  constructor(private row: SheetRowHelper) {}

  toJSON(): Material {
    const keys: (keyof Material)[] = [
      "actorName",
      "iconUrl",
      "name",
      "sortKeys",
    ];
    return Object.fromEntries(
      keys.map((key) => [key, this[key]])
    ) as unknown as Material;
  }

  get name(): string {
    return this.row.getField("Name", z.string());
  }

  get actorName(): string {
    return this.row.getField("ActorName", z.string());
  }

  get sortKeys(): Material["sortKeys"] {
    return {
      name: this.name,
      type: this.row
        .getField("Inventory Order (By type)", z.number())
        .toString()
        .padStart(3, "0"),
    };
  }

  get iconUrl(): string {
    return `/images/materials/${this.actorName}.avif`;
  }

  private _getIconDownloadUrl(): string | null {
    const result = this.row.getField(`Inventory Icon`, zImageFromFormula);
    return result?.formula ?? null;
  }

  hasIcon(): boolean {
    return this._getIconDownloadUrl() !== null;
  }

  async getIconBuffer(): Promise<ArrayBuffer | null> {
    const iconUrl = this._getIconDownloadUrl();
    if (iconUrl) {
      const res = await fetch(iconUrl);
      if (res.ok) return res.arrayBuffer();
      throw new Error(await res.text());
    }
    return null;
  }
}

const IMAGE_RE = /IMAGE\("(?<url>.+)"\)/;

function extractImage(val: string, ctx: RefinementCtx): string {
  const match = val.match(IMAGE_RE);
  if (!match) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Formula did not match expected format of `IMAGE("${url}")`>',
    });
    return z.NEVER;
  }
  return match.groups?.["url"]!;
}

const zImageFromFormula = z.nullable(
  z.object({ formula: z.string().transform(extractImage) })
);
