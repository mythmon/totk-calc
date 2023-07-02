import type { ComponentWithChildren } from "../component";
import cx from "classnames";
import { type HTMLProps } from "react";

export const Select: ComponentWithChildren<HTMLProps<HTMLSelectElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <select className={cx("p-1", className)} {...props}>
      {children}
    </select>
  );
};
