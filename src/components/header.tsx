import { AuthInfo } from "@/components/authInfo";
import type { Component, ComponentWithChildren } from "@/components/component";
import Link from "next/link";
import cx from "classnames";

export const Header: Component = () => {
  return (
    <header className="flex p-3 bg-gray-800 text-white gap-6">
      <div className="bold">TOTK Calc</div>
      <NavLink target="/armor">Armor</NavLink>
      <div className="grow" />
      <AuthInfo className="justify-self-end" />
    </header>
  );
};

const NavLink: ComponentWithChildren<{ target: string }> = ({
  children,
  target,
}) => {
  return (
    <Link className={cx({ "font-bold": false })} href={target}>
      {children}
    </Link>
  );
};
