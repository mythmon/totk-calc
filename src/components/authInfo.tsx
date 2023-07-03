"use client";

import type { Component } from "@/components/component";
import { useSession, signIn, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (status === "authenticated") {
    if (!session?.user) throw new Error("signed in but no user");
    return (
      <>
        <div className={partClassName}>
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="inline mr-2 w-[24px] h-[24px]"
              src={session.user.image}
              alt={`Avatar for ${session.user.name}`}
            />
          )}
          {session.user.name}
        </div>
        <div className={partClassName}>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <button className={partClassName} onClick={() => signIn("discord")}>
        Sign in
      </button>
    );
  }

  throw new Error(`Unexpected auth status ${status}`);
};
