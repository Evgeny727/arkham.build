import { useTranslation } from "react-i18next";
import type { Card } from "@/store/schemas/card.schema";
import { displayAttribute } from "@/utils/card-utils";
import { formatSlots } from "@/utils/formatting";
import { CardSlots } from "../card-slots";
import css from "./card.module.css";

type Props = {
  card: Card;
  omitSlotIcon?: boolean;
};

export function CardDetails(props: Props) {
  const { card, omitSlotIcon } = props;
  const { t } = useTranslation();

  const showType = card.type_code !== "investigator";

  return (
    <div className={css["details"]}>
      <div className={css["details-text"]}>
        {(showType || !!card.subtype_code || card.real_slot) && (
          <p className={css["details-type"]}>
            {showType && <span>{t(`common.type.${card.type_code}`)}</span>}
            {card.subtype_code && (
              <span>{t(`common.subtype.${card.subtype_code}`)}</span>
            )}
            {card.real_slot && <span>{formatSlots(card.real_slot)}</span>}
          </p>
        )}
        {card.real_traits && (
          <p className={css["details-traits"]}>
            {displayAttribute(card, "traits")}
          </p>
        )}
        {!!card.doom && (
          <p>
            {t("common.doom")}: {card.doom}
          </p>
        )}
        {(!!card.clues || !!card.shroud) && (
          <p>
            <span data-testid="shroud">
              {t("common.shroud")}:{" "}
              {card.shroud != null ? (
                card.shroud
              ) : (
                <i className="icon-numNull" />
              )}
              {card.shroud_per_investigator && (
                <>
                  {" "}
                  <i className="icon-text icon-per_investigator" />
                </>
              )}
            </span>
            {", "}
            <span data-testid="clues">
              {t("common.clue", { count: 2 })}: {card.clues}
              {!!card.clues && !card.clues_fixed && (
                <>
                  {" "}
                  <i className="icon-text icon-per_investigator" />
                </>
              )}
            </span>
          </p>
        )}
      </div>
      {!omitSlotIcon && card.real_slot && (
        <CardSlots className={css["details-slots"]} slot={card.real_slot} />
      )}
    </div>
  );
}
