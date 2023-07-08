import type { ComponentWithChildren } from "@/components/component";
import cx from "classnames";
import { type HTMLProps } from "react";

export const Button: ComponentWithChildren<
  HTMLProps<HTMLButtonElement> & {
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    submitting?: boolean;
    flavor?: undefined | "primary";
  }
> = ({ children, className, disabled, submitting, flavor, ...props }) => {
  return (
    <button
      className={cx(
        "py-1 px-2 mx-1 border bg-slate-200",
        { "bg-blue-600 text-white": flavor === "primary" },
        { "opacity-30 cursor-not-allowed": disabled },
        className
      )}
      disabled={disabled || submitting}
      {...props}
    >
      {children}
    </button>
  );
};
