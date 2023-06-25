import fs from "node:fs/promises";
import sharp from "sharp";
import { Queue } from "async-await-queue";
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

  const queue = new Queue<void>(4);
  const promises: Promise<void>[] = [];
  for (const [idx, image] of images.entries()) {
    promises.push(
      queue.run(async () => {
        const dest = `./public/images/armor/${image.actorName}.avif`;
        console.log(`(${idx + 1}/${images.length}) ${dest}`);
        await sharp(image.arrayBuffer).avif({ quality: 80 }).toFile(dest);
      })
    );
  }
  await queue.flush();
  await Promise.all(promises);
}

main().catch((e) => console.error(e));
