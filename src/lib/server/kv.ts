import "server-only";
import { createHash } from "node:crypto";
import type { User } from "../shared/user";

export function userPrefix(user: User) {
  const hash = createHash("sha256");
  hash.update(user.sub);
  return hash.digest().toString("base64");
}
