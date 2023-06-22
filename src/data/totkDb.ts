import type { Workbook } from "exceljs";
import * as excelJs from "exceljs";
import path from "node:path";
import fs from "node:fs";

let workbook: Promise<Workbook> | null = null;

export async function loadWorkbook(): Promise<Workbook> {
  if (!workbook) {
    workbook = (async () => {
      console.log("loadWorkbook 1", Date.now() % 10_000);
      const workbook = new excelJs.Workbook();
      const filePath = path.join(process.cwd(), "totk-db.xlsx");
      const stream = fs.createReadStream(filePath);
      console.log("loadWorkbook 2", Date.now() % 10_000);
      await workbook.xlsx.read(stream);
      console.log("loadWorkbook 3", Date.now() % 10_000);
      return workbook;
    })();
  }

  return await workbook;
}
