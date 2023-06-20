import type { Workbook } from "exceljs";
import * as excelJs from "exceljs";
import path from "node:path";
import fs from "node:fs";

let workbook: Promise<Workbook> | null = null;

export async function loadWorkbook(): Promise<Workbook> {
  if (!workbook) {
    workbook = (async () => {
      console.log("loadWorkbook 1");
      const workbook = new excelJs.Workbook();
      console.log("loadWorkbook 2");
      const filePath = path.join(process.cwd(), 'totk-db.xlsx');
      console.log("loadWorkbook 3", filePath);
      const stream = fs.createReadStream(filePath);
      console.log("loadWorkbook 4");
      const wb2 = await workbook.xlsx.read(stream);
      console.log("loadWorkbook 5");
      console.log("@@@ wb1 === wb2?", workbook === wb2);
      console.log("loadWorkbook 6");
      return workbook;
    })();
  }

  return await workbook;
}
