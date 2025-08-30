/** biome-ignore-all lint/a11y/useKeyWithClickEvents: not relevant. */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: backdrop needs to be clickable. */
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useStore } from "@/store";
import {
  getRelatedCardQuantity,
  getRelatedCards,
} from "@/store/lib/resolve-card";
import type { Card as ICard } from "@/store/schemas/card.schema";
import { selectCardWithRelations } from "@/store/selectors/card-view";
import { selectListCards } from "@/store/selectors/lists";
import {
  getCanonicalCardCode,
  isSpecialist,
  isStaticInvestigator,
} from "@/utils/card-utils";
import { cx } from "@/utils/cx";
import { formatRelationTitle } from "@/utils/formatting";
import { isEmpty } from "@/utils/is-empty";
import { useHotkey } from "@/utils/use-hotkey";
import { useMedia } from "@/utils/use-media";
import { useResolvedDeck } from "@/utils/use-resolved-deck";
import { Annotation } from "../annotations/annotation";
import { PopularDecks } from "../arkhamdb-decklists/popular-decks";
import { Card } from "../card/card";
import { CardSet } from "../cardset";
import { Customizations } from "../customizations/customizations";
import { CustomizationsEditor } from "../customizations/customizations-editor";
import { AttachableCards } from "../deck-tools/attachable-cards";
import { CardPoolExtension } from "../limited-card-pool/card-pool-extension";
import { Button } from "../ui/button";
import { useDialogContextChecked } from "../ui/dialog.hooks";
import { HotkeyTooltip } from "../ui/hotkey";
import { Modal, ModalActions, ModalBackdrop, ModalInner } from "../ui/modal";
import { CardReviewsLink } from "./card-arkhamdb-links";
import css from "./card-modal.module.css";
import { AnnotationEdit } from "./card-modal-annotation-edit";
import { CardModalAttachmentQuantities } from "./card-modal-attachment-quantities";
import { useCardModalContextChecked } from "./card-modal-context";
import { CardModalQuantities } from "./card-modal-quantities";
import { CardPageLink } from "./card-page-link";
import { SpecialistAccess, SpecialistInvestigators } from "./specialist";

type Props = {
  code: string;
};

export function CardModal(props: Props) {
  const { t } = useTranslation();
  const ctx = useResolvedDeck();

  const canEdit = ctx.canEdit;

  const modalContext = useDialogContextChecked();

  const onCloseModal = useCallback(() => {
    modalContext?.setOpen(false);
  }, [modalContext]);

  const quantitiesRef = useRef<HTMLDivElement>(null);

  const onClickBackdrop = useCallback(
    (evt: React.MouseEvent) => {
      if (evt.target === quantitiesRef.current) {
        onCloseModal();
      }
    },
    [onCloseModal],
  );

  const cardWithRelations = useStore((state) =>
    selectCardWithRelations(state, props.code, true, ctx.resolvedDeck),
  );

  const cardModalCtx = useCardModalContextChecked();
  const completeTask = useStore((state) => state.completeTask);

  const onCompleteTask = useCallback(() => {
    if (!ctx.resolvedDeck || !cardWithRelations?.card) return;

    const nextCode = completeTask(ctx.resolvedDeck.id, cardWithRelations.card);
    cardModalCtx.setOpen({ code: nextCode });
  }, [
    completeTask,
    ctx.resolvedDeck,
    cardWithRelations?.card,
    cardModalCtx.setOpen,
  ]);

  const activeListCards = useStore((state) =>
    // FIXME: this does not work for spirit deck
    selectListCards(state, ctx.resolvedDeck, "slots"),
  );

  const canRenderFull = useMedia("(min-width: 45rem)");

  if (!cardWithRelations) return null;

  const showQuantities =
    !!ctx.resolvedDeck && cardWithRelations?.card.type_code !== "investigator";
  const showExtraQuantities = ctx.resolvedDeck?.hasExtraDeck;
  const related = getRelatedCards(cardWithRelations);

  const attachableDefinition = ctx.resolvedDeck?.availableAttachments.find(
    (config) => config.code === cardWithRelations.card.code,
  );

  const annotation = ctx.resolvedDeck?.annotations[cardWithRelations.card.code];

  const cardNode = (
    <>
      <Card
        className={cx(css["card"], css["shadow"])}
        resolvedCard={cardWithRelations}
        size={canRenderFull ? "full" : "compact"}
        slotCardFooter={
          <>
            {ctx.resolvedDeck && cardWithRelations.card.card_pool_extension && (
              <div className={css["related"]}>
                <CardPoolExtension
                  canEdit={canEdit}
                  card={cardWithRelations.card}
                  deck={ctx.resolvedDeck}
                  showLabel
                />
              </div>
            )}

            {!!ctx.resolvedDeck &&
              (canEdit ? (
                <div className={css["related"]}>
                  <AnnotationEdit
                    cardCode={cardWithRelations.card.code}
                    deckId={ctx.resolvedDeck.id}
                    text={annotation}
                  />
                </div>
              ) : (
                annotation && (
                  <div className={css["related"]}>
                    <Annotation content={annotation} />
                  </div>
                )
              ))}
          </>
        }
      >
        {ctx.resolvedDeck && !!attachableDefinition && (
          <AttachableCards
            card={cardWithRelations.card}
            definition={attachableDefinition}
            readonly={!canEdit}
            resolvedDeck={ctx.resolvedDeck}
          />
        )}
        {cardWithRelations.card.customization_options ? (
          ctx.resolvedDeck ? (
            <CustomizationsEditor
              canEdit={canEdit}
              card={cardWithRelations.card}
              deck={ctx.resolvedDeck}
            />
          ) : (
            <Customizations card={cardWithRelations.card} />
          )
        ) : undefined}
      </Card>
      {!isEmpty(related) && (
        <div className={css["related"]}>
          {related.map(([key, value]) => {
            const cards = Array.isArray(value) ? value : [value];
            return (
              <CardSet
                className={cx(css["cardset"], css["shadow"])}
                key={key}
                set={{
                  title: formatRelationTitle(key),
                  cards,
                  id: key,
                  selected: false,
                  quantities: getRelatedCardQuantity(key, cards),
                }}
              />
            );
          })}
          {cardWithRelations.card.type_code === "investigator" && (
            <SpecialistAccess card={cardWithRelations.card} />
          )}
        </div>
      )}
      {isSpecialist(cardWithRelations.card) && (
        <div className={css["related"]}>
          <SpecialistInvestigators card={cardWithRelations.card} />
        </div>
      )}
      {!ctx.resolvedDeck && (
        <div className={css["related"]}>
          <PopularDecks scope={cardWithRelations.card} />
        </div>
      )}
    </>
  );

  const canonicalCode = getCanonicalCardCode(cardWithRelations.card);

  const traits = cardWithRelations.card.real_traits;
  const deckQuantity = ctx.resolvedDeck?.slots[canonicalCode] ?? 0;

  return (
    <Modal key={cardWithRelations.card.code} data-testid="card-modal">
      <ModalBackdrop />
      <ModalInner size="60rem">
        <ModalActions>
          {cardWithRelations.card.type_code === "investigator" &&
            !isStaticInvestigator(cardWithRelations.card) && (
              <Link
                asChild
                href={
                  cardWithRelations.card.parallel
                    ? `/deck/create/${canonicalCode}?initial_investigator=${cardWithRelations.card.code}`
                    : `/deck/create/${canonicalCode}`
                }
                onClick={onCloseModal}
              >
                <Button as="a" data-testid="card-modal-create-deck">
                  <i className="icon-deck" /> {t("deck.actions.create")}
                </Button>
              </Link>
            )}
          <CardPageLink card={cardWithRelations.card} />
          <CardReviewsLink card={cardWithRelations.card} />
          {canEdit &&
            !!deckQuantity &&
            traits?.includes("Task") &&
            traits?.includes("Incomplete") && (
              <Button onClick={onCompleteTask}>
                <CheckCircleIcon />
                {t("card_modal.actions.complete_task")}
              </Button>
            )}
        </ModalActions>
        {showQuantities || activeListCards ? (
          <div className={css["container"]}>
            <div className={css["card"]}>{cardNode}</div>
            <div
              className={css["quantities"]}
              onClick={onClickBackdrop}
              ref={quantitiesRef}
            >
              {showQuantities && (
                <CardModalQuantities
                  canEdit={canEdit}
                  card={cardWithRelations.card}
                  deck={ctx.resolvedDeck}
                  onCloseModal={onCloseModal}
                  showExtraQuantities={showExtraQuantities}
                />
              )}
              {!isEmpty(ctx.resolvedDeck?.availableAttachments) && (
                <CardModalAttachmentQuantities
                  card={cardWithRelations.card}
                  resolvedDeck={ctx.resolvedDeck}
                />
              )}
              {activeListCards && (
                <CardModalArrowNavigation
                  activeListCards={activeListCards}
                  code={props.code}
                />
              )}
            </div>
          </div>
        ) : (
          cardNode
        )}
      </ModalInner>
    </Modal>
  );
}

function CardModalArrowNavigation(props: {
  activeListCards?: { cards: ICard[] };
  code: string;
}) {
  const activeListCards = props.activeListCards;

  const { t } = useTranslation();
  const cardModalCtx = useCardModalContextChecked();

  const cardPosition =
    activeListCards?.cards.findIndex((card) => card.code === props.code) ?? -1;

  const nextCard = activeListCards?.cards[cardPosition + 1];
  const previousCard = activeListCards?.cards[cardPosition - 1];

  const onNextCard = useCallback(() => {
    if (nextCard) {
      cardModalCtx.setOpen({ code: nextCard.code });
    }
  }, [cardModalCtx, nextCard]);

  const onPreviousCard = useCallback(() => {
    if (previousCard) {
      cardModalCtx.setOpen({ code: previousCard.code });
    }
  }, [cardModalCtx, previousCard]);

  useHotkey("arrowdown", onNextCard, { disabled: !nextCard });
  useHotkey("arrowup", onPreviousCard, { disabled: !previousCard });

  return (
    <nav className={css["neighbour-nav"]}>
      <HotkeyTooltip
        keybind="arrowup"
        description={t("lists.actions.previous_card")}
      >
        <Button
          onClick={onPreviousCard}
          disabled={!previousCard}
          iconOnly
          size="lg"
        >
          <ArrowUpIcon />
        </Button>
      </HotkeyTooltip>
      <HotkeyTooltip
        keybind="arrowdown"
        description={t("lists.actions.next_card")}
      >
        <Button onClick={onNextCard} disabled={!nextCard} iconOnly size="lg">
          <ArrowDownIcon />
        </Button>
      </HotkeyTooltip>
    </nav>
  );
}
