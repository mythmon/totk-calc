import { getServerSession } from "next-auth";
import { config } from "./config";
import z from "zod";
import { HttpError } from "@/app/api/errors";
import { fromPromise, type ResultAsync } from "neverthrow";
import { znt } from "./znt";

export const User = znt(
  z.object({
    name: z.string(),
    email: z.string().email(),
    image: z.string().url(),
  })
);

export type User = z.infer<typeof User>;

export const UserSession = znt(
  z.object({
    user: User,
    expires: z.optional(z.string().transform((s) => new Date(s))),
  })
);

export type UserSession = z.infer<typeof UserSession>;

export function requireSession(): ResultAsync<UserSession, HttpError> {
  return fromPromise(getServerSession(config.auth), HttpError.mapErr)
    .andThen((session) => {
      console.log(session);
      return UserSession.parseNt(session);
    })
    .mapErr((e) => HttpError.unauthorized(`${e}`));
}
