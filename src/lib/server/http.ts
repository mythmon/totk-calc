import "server-only";
import { ResultAsync } from "neverthrow";
import type { NextRequest } from "next/server";

export function json<T>(request: NextRequest): ResultAsync<T, Error> {
  return ResultAsync.fromPromise(request.json(), (error) =>
    error instanceof Error ? error : new Error(`unknown: ${error}`)
  );
}
