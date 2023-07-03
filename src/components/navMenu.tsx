"use client";

import { useState } from "react";
import type { Component } from "./component";
import { GearIcon } from "./icons";
import Link from "next/link";
import cx from "classnames";
import { navLinks } from "./header";
import { AuthInfoParts } from "./authInfo";

export const NavMenu: Component = () => {
  const [expand, setExpand] = useState(false);
  const itemClassName = "p-4 border-b-2 border-b-white last:border-none";

  return (
    <div className="contents relative">
      <div className="grow" />
      <GearIcon
        width="24px"
        height="24px"
        onClick={() => setExpand((ex) => !ex)}
      />
      {expand && (
        <div
          className={cx(
            "absolute right-2 top-14",
            "flex flex-col",
            "px-2 bg-gray-800 text-white",
            "text-lg font-bold"
          )}
        >
          {navLinks.map(({ href, text, Icon }) => (
            <Link
              key={href}
              href={href}
              className={itemClassName}
              onClick={() => setExpand(false)}
            >
              <Icon
                className="inline"
                width="24px"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />{" "}
              {text}
            </Link>
          ))}
          <AuthInfoParts partClassName={itemClassName} />
        </div>
      )}
    </div>
  );
};
