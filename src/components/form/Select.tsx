import type { ComponentWithChildren } from "@/components/component";
import cx from "classnames";
import { type ChangeEvent, type HTMLProps } from "react";

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  onChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: ComponentWithChildren<SelectProps> = ({
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
