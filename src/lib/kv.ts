import { createHash } from "node:crypto";
import type { Session } from "next-auth";

export function userPrefix(user: NonNullable<Session["user"]>) {
  if (!("email" in user) || !user.email) throw new Error("email is required in session");
  const hash = createHash("sha256");
  hash.update(user.email);
  return hash.digest().toString("base64");
}
