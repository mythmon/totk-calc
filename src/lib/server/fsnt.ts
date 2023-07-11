import { ResultAsync } from "neverthrow";
import type { PathLike } from "node:fs";
import fsp from "node:fs/promises";

const fsnt = {
  readFile(path: PathLike, options: BufferEncoding) {
    return ResultAsync.fromPromise(fsp.readFile(path, options), (err) => err);
  },
};

export default fsnt;
