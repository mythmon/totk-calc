import fs from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import * as excelJs from "exceljs";
import type { Workbook } from "exceljs";
import fetch from "node-fetch";
import { config } from "../../src/lib/config";

const XLSX_PATH = path.join(process.cwd(), "totk-db.xlsx");

export async function loadWorkbook(): Promise<Workbook> {
  const workbook = new excelJs.Workbook();
  try {
    await workbook.xlsx.readFile(XLSX_PATH);
  } catch (error) {
    if (`${error}`.includes("File not found")) {
      const url = `https://docs.google.com/spreadsheets/d/e/${config.google.sheetId}/pub?output=xlsx`;
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
