import type { Card } from "@arkham-build/shared";
import { FloatingPortal, shift } from "@floating-ui/react";
import { useCallback } from "react";
import { CardTooltip } from "@/components/card-tooltip/card-tooltip";
import { useRestingTooltip } from "@/components/ui/tooltip.hooks";
import { useStore } from "@/store";
import { displayAttribute } from "@/utils/card-utils";
import { FLOATING_PORTAL_ID } from "@/utils/constants";
import css from "./choose-investigator.module.css";

type Props = {
  card: Card;
};

export function SignatureLink(props: Props) {
  const { card } = props;

  const {
    closeTooltip,
    refs,
    referenceProps,
    isMounted,
    floatingStyles,
    transitionStyles,
  } = useRestingTooltip({
    middleware: [shift({ padding: 5 })],
    placement: "right",
  });

  const openCardModal = useStore((state) => state.openCardModal);

  const openModal = useCallback(() => {
    closeTooltip();
    openCardModal(card.code);
  }, [card.code, closeTooltip, openCardModal]);

  return (
    <li className={css["signature"]} key={card.code}>
      <button ref={refs.setReference} {...referenceProps} onClick={openModal}>
        {displayAttribute(card, "name")}
      </button>
      {isMounted && (
        <FloatingPortal id={FLOATING_PORTAL_ID}>
          <div ref={refs.setFloating} style={floatingStyles}>
            <div style={transitionStyles}>
              <CardTooltip code={card.code} />
            </div>
          </div>
        </FloatingPortal>
      )}
    </li>
  );
}
