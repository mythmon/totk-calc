import type { SVGProps } from "react";
import type { Component } from "../component";

/* Icon is the function component type for SVG icons. It takes an optional
 * extra type like Icon<{title: string}> which adds "title" to the props
 * definition. */
export type Icon<E = Record<never, never>> = Component<
  SVGProps<SVGSVGElement> & E
>;

export { ArmorIcon } from "./armor";
export { DyeIcon } from "./dye";
export { GearIcon } from "./gear";
export { RupeeIcon } from "./rupee";
