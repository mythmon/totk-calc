import fs from "node:fs/promises";
import sharp from "sharp";
import { loadWorkbook } from "../src/data/totkDb";

async function main() {
  await fs.mkdir("./public/images/armor", { recursive: true });

  const workbook = await loadWorkbook();
  const armorSheet = workbook.getWorksheet("Armors");
  const imageInfoByTl = Object.fromEntries(
    armorSheet.getImages().map((d) => [d.range.tl.nativeRow, d])
  );

  const images: { actorName: string; arrayBuffer: ArrayBuffer }[] = [];
  armorSheet.eachRow((row, rowNumber) => {
    if (!row.hasValues) return;
    if (rowNumber === 1) return;
    const actorName = row.getCell(2).value;
    if (!actorName || typeof actorName !== "string") return;
    const imageInfo = imageInfoByTl[rowNumber - 1];
    if (!imageInfo) return;
    const arrayBuffer = workbook.getImage(+imageInfo.imageId).buffer;
    if (!arrayBuffer) return;
    images.push({ actorName, arrayBuffer });
  });

  for (const image of images) {
    console.log(image.actorName);
    const dest = `./public/images/armor/${image.actorName}.avif`;
    await sharp(image.arrayBuffer).avif({ quality: 80 }).toFile(dest);
  }
}

main().catch((e) => console.error(e));
