import { AuthInfo } from "@/components/authInfo";
import type { Component } from "@/components/component";
import Link from "next/link";
import { NavMenu } from "./navMenu";
import { ArmorIcon, DyeIcon, type Icon, type IconBaseProps } from "./icons";
import { StarIcon } from "./icons/star";

export const Header: Component = () => {
  return (
    <header className="flex p-3 bg-gray-800 text-white gap-6">
      <div className="bold">TOTK Calc</div>
      <div className="contents md:hidden">
        <NavMenu />
      </div>
      <div className="hidden md:contents">
        <NavBar />
      </div>
    </header>
  );
};

interface NavLink {
  href: string;
  text: string;
  Icon: Icon;
}

export const navLinks: NavLink[] = [
  { href: "/armor", text: "Armor", Icon: ArmorIcon },
  {
    href: "/upgrades",
    text: "Upgrades",
    Icon: (props: IconBaseProps) => (
      <StarIcon stroke="white" fill="none" {...props} />
    ),
  },
  { href: "/dye", text: "Dye", Icon: DyeIcon },
];

const NavBar: Component = () => {
  return (
    <>
      {navLinks.map(({ href, text, Icon }) => (
        <Link key={href} href={href}>
          <Icon className="inline mr-1" width="32px" />
          {text}
        </Link>
      ))}
      <div className="grow" />
      <AuthInfo className="justify-self-end" />
    </>
  );
};
