import { NextResponse } from "next/server";
import { type MaterialsRes } from "./types";
import { HttpError, type ErrorResponse } from "../errors";
import fsnt from "@/lib/server/fsnt";
import { z, type ZodTypeDef } from "zod";
import { znt, type ZodSchemaNeverThrow } from "@/lib/shared/znt";
import { zu } from "zod_utilz";
import path from "path";
import { Material } from "@/lib/shared/material";
import { getConfig } from "@/lib/server/config";

const MATERIALS_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "materials.json"
);

const fileParser: ZodSchemaNeverThrow<Material[]> = znt<
  Material[],
  ZodTypeDef,
  unknown
>(zu.stringToJSON().pipe(z.array(Material)));

export async function GET(): Promise<
  NextResponse<MaterialsRes> | ErrorResponse
> {
  const cacheControl =
    getConfig().env === "development" ? "no-cache" : "public, max-age=900";

  return fsnt
    .readFile(MATERIALS_PATH, "utf-8")
    .andThen((data) => fileParser.parseNt(data))
    .match<NextResponse<MaterialsRes> | ErrorResponse>(
      (materials) =>
        NextResponse.json(
          { materials },
          { headers: { "Cache-Control": cacheControl } }
        ),
      (err) => HttpError.mapErr(err).toResponse()
    );
}
