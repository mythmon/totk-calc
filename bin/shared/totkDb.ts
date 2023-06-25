import * as excelJs from "exceljs";
import type { Workbook } from "exceljs";
import path from "node:path";

export async function loadWorkbook(): Promise<Workbook> {
  const workbook = new excelJs.Workbook();
  await workbook.xlsx.readFile(path.join(process.cwd(), "totk-db.xlsx"));
  return workbook;
}
