import { CheckIcon } from "lucide-react";
import { forwardRef, useCallback } from "react";
import { cx } from "@/utils/cx";
import css from "./checkbox.module.css";

interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "label" | "onChange"
  > {
  className?: string;
  hideLabel?: boolean;
  id?: string;
  label: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef(function Checkbox(
  props: Props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { className, id, hideLabel, label, onCheckedChange, ...rest } = props;

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(evt.target.checked);
    },
    [onCheckedChange],
  );

  return (
    <div className={cx(css["checkbox"], className)} ref={ref}>
      <span className={css["control"]}>
        <input
          {...rest}
          id={id}
          type="checkbox"
          className={css["input"]}
          onChange={handleChange}
        />
        <span className={css["box"]}>
          <CheckIcon />
        </span>
      </span>
      <label className={cx(css["label"], hideLabel && "sr-only")} htmlFor={id}>
        {label}
      </label>
    </div>
  );
});
