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
      console.warn(`no icon for ${armor.actorName}`);
      return [];
    }
  });

  if (armorsForImages.length) {
    console.log("writing data");
    const queue = new Queue<void>(1);
    const promises: Promise<void>[] = [];
    await fs.mkdir("./.next/cache/mythmon/downloads", { recursive: true });
    for (const [idx, armor] of armorsForImages.entries()) {
      promises.push(
        queue.run(async () => {
          process.stdout.write(
            `(${idx + 1}/${armorsForImages.length}) ${armor.actorName} `
          );
          for (const color of armor.colors) {
            const fileName = `${armor.actorName}_${color}.avif`;
            const cachePath = `./.next/cache/mythmon/downloads/${fileName}`;
            const publicPath = `./public/images/armor/${fileName}`;
            let exists;
            try {
              await fs.access(publicPath, fs.constants.R_OK);
              exists = true;
            } catch {
              exists = false;
            }
            if (exists) {
              process.stdout.write("e");
              continue;
            }

            try {
              await fs.copyFile(cachePath, publicPath);
              process.stdout.write("c");
              continue;
            } catch {}

            const image = await armor.getIconBuffer(color);
            if (image) {
              const convertedBuffer = await sharp(image)
                .avif({ quality: 80 })
                .toBuffer();
              await fs.writeFile(publicPath, convertedBuffer);
              await fs.writeFile(cachePath, convertedBuffer);
              process.stdout.write("d");
              continue;
            }
          }
          process.stdout.write("\n");
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
