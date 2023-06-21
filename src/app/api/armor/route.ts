import { NextResponse } from "next/server";
import { loadWorkbook } from "@/data/totkDb";
import type { CellValue } from "exceljs";

export interface Armor { 
  actorname: string;
  euen_name: string;
  belonging_set: string;
  buying_price: number;
  base_defense: number;
  defense_1: number;
  defense_2: number;
  defense_3: number;
  defense_4: number;
  base_selling_price: number;
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
  armor: Armor[];
  fields: Record<keyof Armor, { title: string }>;
}

export async function GET(): Promise<Response> {
  const workbook = await loadWorkbook();

  const armor = workbook.getWorksheet("Armors");
  const headers = (armor.getRow(1).values as Array<string>)?.map(s => ({ original: s, slug: sluggify(s) }));

  // const data = armor.data.slice(1).map(row => Object.fromEntries(headers.map((key, index) => [key, row[index]])));
  // const data = armor.getRows(2, armor.rowCount - 1)
  //   ?.map(row => row.values ? Object.fromEntries((row.values as Array<unknown>).map((cell, i) => [headers[i], cell])) : null);
  const data: unknown[] = [];
  armor.eachRow((row, rowNumber) => {
    if (!row.hasValues) return;
    if (rowNumber === 1) return;
    const values = row.values as Array<CellValue>;
    data.push(Object.fromEntries(values.flatMap((d, i) => {
      const key = headers[i]?.slug;
      if (!d || !key) return [];
      return [[key, d]];
    })));
  });

  const fields = Object.fromEntries(Object.values(headers).map(d => [d.slug, { title: d.original }]));
  delete fields["icon"];

  return NextResponse.json({armor: data, fields});
}

function sluggify(s: string): string {
  return s.toLowerCase()
    .replaceAll(/([A-Z])([a-z])/g, '$1_$2')
    .replaceAll(/★+/g, d => d.length.toString())
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replace(/^_+/, '')
    .replace(/_$/, '');
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
