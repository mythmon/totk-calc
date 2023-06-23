import type { Workbook } from "exceljs";
import * as excelJs from "exceljs";
import path from "node:path";
import fs from "node:fs";

let workbook: Promise<Workbook> | null = null;

export async function loadWorkbook(): Promise<Workbook> {
  if (!workbook) {
    workbook = (async () => {
      const workbook = new excelJs.Workbook();
      const filePath = path.join(process.cwd(), "totk-db.xlsx");
      const stream = fs.createReadStream(filePath);
      await workbook.xlsx.read(stream);
      return workbook;
    })();
  }

  return await workbook;
}
