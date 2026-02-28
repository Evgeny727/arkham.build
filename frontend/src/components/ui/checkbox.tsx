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
  "data-testid"?: string;
  hideLabel?: boolean;
  id?: string;
  label: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef(function Checkbox(
  props: Props,
  ref: React.ForwardedRef<HTMLLabelElement>,
) {
  const {
    className,
    "data-testid": testid,
    id,
    hideLabel,
    label,
    onCheckedChange,
    ...rest
  } = props;

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(evt.target.checked);
    },
    [onCheckedChange],
  );

  return (
    <label className={cx(css["checkbox"], className)} ref={ref}>
      <span className={css["control"]}>
        <input
          {...rest}
          id={id}
          type="checkbox"
          className={cx(css["input"], "sr-only")}
          onChange={handleChange}
        />
        <span data-testid={testid} className={css["box"]}>
          <CheckIcon />
        </span>
      </span>
      <span className={cx(css["label"], hideLabel && "sr-only")}>{label}</span>
    </label>
  );
});
