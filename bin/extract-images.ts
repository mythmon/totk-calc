import fs from "node:fs/promises";
import sharp from "sharp";
import { Queue } from "async-await-queue";
import { ArmorData, loadArmorData } from "./shared/totkDb";

async function main() {
  await fs.mkdir("./public/images/armor", { recursive: true });
  console.log("loading data");
  const armors = await loadArmorData();

  console.log("processing data");
  const armorsForImages: ArmorData[] = armors.flatMap((armor) => {
    if (armor.hasIcon()) {
      return [armor];
    } else {
      console.log(`no icon for ${armor.actorName}`);
      return [];
    }
  });

  if (armorsForImages.length) {
    console.log("writing data");
    const queue = new Queue<void>(4);
    const promises: Promise<void>[] = [];
    for (const [idx, armor] of armorsForImages.entries()) {
      promises.push(
        queue.run(async () => {
          console.log(
            `(${idx + 1}/${armorsForImages.length}) ${armor.actorName}`
          );
          for (const color of armor.colors) {
            const dest = `./public/images/armor/${armor.actorName}_${color}.avif`;
            const image = await armor.getIconBuffer(color);
            if (image) await sharp(image).avif({ quality: 80 }).toFile(dest);
          }
        })
      );
    }
    await queue.flush();
    await Promise.all(promises);
  } else {
    console.warn("Warning: no images found");
  }
  console.log("done");
}

main().catch((e) => console.error(e));
