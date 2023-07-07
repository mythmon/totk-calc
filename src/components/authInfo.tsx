"use client";

import type { Component } from "@/components/component";
import { User } from "@/lib/shared/user";
import { useUser } from "@auth0/nextjs-auth0/client";
import cx from "classnames";

export const AuthInfo: Component<{ className: string }> = ({ className }) => {
  return (
    <div className={cx("flex flex-row-reverse gap-1", className)}>
      <AuthInfoParts partClassName="border-l-2 border-l-white last:border-none px-2" />
    </div>
  );
};

export const AuthInfoParts: Component<{ partClassName?: string }> = ({
  partClassName,
}) => {
  const session = useUser();
  if (session.isLoading) return null;

  return User.parseNt(session.user).match(
    (user) => (
      <>
        <div className={partClassName}>
          {user.picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="inline mr-2 w-[24px] h-[24px]"
              src={user.picture}
              alt={`Avatar for ${user.nickname}`}
            />
          )}
          {user.nickname}
        </div>
        <div className={partClassName}>
          <a href="/api/auth/logout">Sign out</a>
        </div>
      </>
    ),
    (_err) => (
      <a className={partClassName} href="/api/auth/login">
        Login
      </a>
    )
  );
};
