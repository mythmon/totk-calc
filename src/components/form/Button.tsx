import type { ComponentWithChildren } from "../component";
import cx from "classnames";
import { type HTMLProps } from "react";

export const Button: ComponentWithChildren<
  HTMLProps<HTMLButtonElement> & {
    type?: "button" | "submit" | "reset" | undefined;
  }
> = ({ children, className, ...props }) => {
  return (
    <button
      className={cx("py-1 px-2 m-1 border bg-slate-200", className)}
      {...props}
    >
      {children}
    </button>
  );
};
