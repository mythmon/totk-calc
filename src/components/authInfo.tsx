"use client";

import type { Component } from "@/components/component";
import { useSession, signIn, signOut } from "next-auth/react";
import cx from "classnames";

export const AuthInfo: Component<{ className: string }> = ({ className }) => {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (status === "authenticated") {
    if (!session?.user) throw new Error("signed in but no user");
    return (
      <div className={cx("flex gap-1", className)}>
        <button onClick={() => signOut()}>Sign out</button>
        <span className="pl-2 ml-2 border-l border-white">
          {session.user.name}
        </span>
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            style={{ flex: "0 0 16px", width: "24px", height: "24px" }}
            src={session.user.image}
            alt={`Avatar for ${session.user.name}`}
          />
        )}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <button onClick={() => signIn("discord")}>Sign in</button>;
  }

  throw new Error(`Unexpected auth status ${status}`);
};
