import { forwardRef } from "react";
import { cx } from "@/utils/cx";
import { useMedia } from "@/utils/use-media";
import css from "./scroller.module.css";

type ScrollType = "always" | "auto" | "hover" | "scroll";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  type?: ScrollType;
  viewportClassName?: string;
}

export const Scroller = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, className, type, viewportClassName, ...rest } = props;

  const touchDevice = useMedia("(hover: none)");
  const scrollerType =
    touchDevice && type === "hover" ? "scroll" : (type ?? "scroll");

  return (
    <div {...rest} className={cx(css["scroller"], className)}>
      <div
        ref={ref}
        tabIndex={-1}
        className={cx(
          css["viewport"],
          css[`viewport-${scrollerType}`],
          viewportClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
});

Scroller.displayName = "Scroller";
