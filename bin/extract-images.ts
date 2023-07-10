import fs from "node:fs/promises";
import sharp from "sharp";
import { Queue } from "async-await-queue";
import { ArmorData, loadArmorData, loadMaterialData } from "./shared/totkDb";

async function main() {
  const counts = { download: 0, cache: 0, exist: 0, error: 0 };

  const queue = new Queue<void>(1);
  const promises: Promise<void>[] = [];
  await fs.mkdir("./.next/cache/mythmon/downloads", { recursive: true });

  promises.push(armorImages(queue, counts));
  promises.push(materialImages(queue, counts));

  await queue.flush();
  await Promise.all(promises);

  console.log(
    "All images ready:",
    `${counts.exist} already existed,`,
    `${counts.cache} from cache,`,
    `${counts.download} downloaded,`,
    `${counts.error} error`
  );
}

interface Counts {
  download: number;
  cache: number;
  exist: number;
  error: number;
}

async function armorImages(queue: Queue<void>, counts: Counts): Promise<void> {
  await fs.mkdir("./public/images/armor", { recursive: true });

  const armors = await loadArmorData();
  const armorsForImages: ArmorData[] = armors.flatMap((armor) => {
    if (armor.hasIcon()) {
      return [armor];
    } else {
      console.warn(`no icon for ${armor.actorName}`);
      return [];
    }
  });

  const promises: Promise<void>[] = [];
  for (const armor of armorsForImages) {
    promises.push(
      queue.run(async () => {
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
            counts.exist++;
            continue;
          }

          try {
            await fs.copyFile(cachePath, publicPath);
            counts.cache++;
            continue;
          } catch {}

          const image = await armor.getIconBuffer(color);
          if (image) {
            const convertedBuffer = await sharp(image)
              .avif({ quality: 80 })
              .toBuffer();
            await fs.writeFile(publicPath, convertedBuffer);
            await fs.writeFile(cachePath, convertedBuffer);
            counts.download++;
          } else {
            counts.error++;
          }
        }
      })
    );
  }

  await Promise.all(promises);
}

async function materialImages(
  queue: Queue<void>,
  counts: Counts
): Promise<void> {
  await fs.mkdir("./public/images/materials", { recursive: true });
  const materials = await loadMaterialData();
  const promises = [];
  for (const material of materials) {
    promises.push(
      queue.run(async () => {
        const fileName = `${material.actorName}.avif`;
        const cachePath = `./.next/cache/mythmon/downloads/${fileName}`;
        const publicPath = `./public/images/materials/${fileName}`;
        let exists;
        try {
          await fs.access(publicPath, fs.constants.R_OK);
          exists = true;
        } catch {
          exists = false;
        }
        if (exists) {
          counts.exist++;
          return;
        }

        try {
          await fs.copyFile(cachePath, publicPath);
          counts.cache++;
          return;
        } catch {}

        const image = await material.getIconBuffer();
        if (image) {
          const convertedBuffer = await sharp(image)
            .avif({ quality: 80 })
            .toBuffer();
          await fs.writeFile(publicPath, convertedBuffer);
          await fs.writeFile(cachePath, convertedBuffer);
          counts.download++;
        } else {
          counts.error++;
        }
      })
    );
  }
  await Promise.all(promises);
}

main().catch((e) => console.error(e));
