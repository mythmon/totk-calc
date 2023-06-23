import { loadWorkbook } from "@/data/totkDb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: { actorName: string } }): Promise<Response> {
  const requestedArmor = params.actorName;
  if (!requestedArmor) return NextResponse.json({ error: "invalid armor name" }, { status: 400 });
  const workbook = await loadWorkbook();
  const armors = workbook.getWorksheet("Armors");

  let targetRow: null | number = null;
  armors.eachRow((row, rowNumber) => {
    if (targetRow !== null) return;
    if (!row.hasValues) return;
    if (rowNumber === 1) return;
    if (row.getCell(2).value == requestedArmor) {
      targetRow = rowNumber;
    }
  });

  if (targetRow === null)
    return NextResponse.json({ error: "armor not found" }, { status: 404 });

  let imageInfo = armors
    .getImages()
    .find((d) => d.range.tl.nativeRow === targetRow! - 1);
  if (!imageInfo)
    return NextResponse.json({ error: "no image in row" }, { status: 404 });

  const image = workbook.getImage(+imageInfo.imageId);

  return new Response(image.buffer);
}
