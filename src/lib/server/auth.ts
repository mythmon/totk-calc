import "server-only";

import { HttpError } from "@/app/api/errors";
import { fromPromise, type ResultAsync } from "neverthrow";
import { getSession } from "@auth0/nextjs-auth0";
import { UserSession } from "@/lib/shared/user";

export function requireSession(): ResultAsync<UserSession, HttpError> {
  return fromPromise(getSession(), HttpError.mapErr)
    .andThen((session) => {
      return UserSession.parseNt(session);
    })
    .mapErr((e) => HttpError.unauthorized(`${e}`));
}
