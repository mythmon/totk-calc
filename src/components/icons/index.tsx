import type { SVGProps } from "react";
import type { Component } from "@/components/component";

/* Icon is the function component type for SVG icons. It takes an optional
 * extra type like Icon<{title: string}> which adds "title" to the props
 * definition. */
export type Icon<E extends IconBaseProps = IconBaseProps> = Component<
  SVGProps<SVGSVGElement> & E
>;

export interface IconBaseProps {
  size?: number;
}

export { ArmorIcon } from "./armor";
export { DyeIcon } from "./dye";
export { GearIcon } from "./gear";
export { RupeeIcon } from "./rupee";
