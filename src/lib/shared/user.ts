import z from "zod";
import { znt } from "./znt";

export const User = znt(
  z.object({
    nickname: z.string(),
    picture: z.string().url(),
    sub: z.string(),
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
