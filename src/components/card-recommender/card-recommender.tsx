import { useQuery } from "@tanstack/react-query";
import { forwardRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ErrorDisplay } from "@/pages/errors/error-display";
import { useStore } from "@/store";
import type { ResolvedDeck } from "@/store/lib/types";
import type { Card } from "@/store/schemas/card.schema";
import type {
  Recommendation,
  Recommendations,
} from "@/store/schemas/recommendations.schema";
import { type ListState, selectListCards } from "@/store/selectors/lists";
import { selectMetadata } from "@/store/selectors/shared";
import { getRecommendations } from "@/store/services/queries";
import { ApiError } from "@/store/services/requests/shared";
import { deckTickToString } from "@/store/slices/recommender";
import { cx } from "@/utils/cx";
import { useResolvedColorTheme } from "@/utils/use-color-theme";
import { useResolvedDeck } from "@/utils/use-resolved-deck";
import { CardList } from "../card-list/card-list";
import { CardSearch } from "../card-list/card-search";
import type { CardListProps } from "../card-list/types";
import { Footer } from "../footer";
import { Loader } from "../ui/loader";
import css from "./card-recommender.module.css";
import { DeckDateRangeFilter } from "./deck-date-range-filter";
import { IncludeSideDeckToggle } from "./include-side-deck-toggle";
import { RecommendationBar } from "./recommendation-bar";
import { RecommenderRelativityToggle } from "./recommender-relativity-toggle";

export const CardRecommender = forwardRef(function CardRecommender(
  props: CardListProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { slotLeft, slotRight, ...rest } = props;

  const { t } = useTranslation();
  const { resolvedDeck } = useResolvedDeck();

  const listState = useStore((state) =>
    selectListCards(state, resolvedDeck, "slots"),
  );

  const metadata = useStore(selectMetadata);

  const recommender = useStore((state) => state.recommender);
  const {
    includeSideDeck,
    isRelative,
    deckFilter: dateRange,
    coreCards,
  } = recommender;

  const recommendationQuery = () => {
    if (!resolvedDeck?.id) {
      return Promise.resolve({ recommendations: [], decks_analyzed: 0 });
    }

    const dateRangeStrings = dateRange.map(deckTickToString) as [
      string,
      string,
    ];

    const canonicalFrontCode =
      resolvedDeck?.metaParsed.alternate_front ??
      resolvedDeck?.investigator_code;

    const canonicalBackCode =
      resolvedDeck?.metaParsed.alternate_back ??
      resolvedDeck?.investigator_code;

    const canonicalizedInvestigatorCode = `${canonicalFrontCode}-${canonicalBackCode}`;

    return getRecommendations(
      canonicalizedInvestigatorCode,
      includeSideDeck,
      isRelative,
      coreCards[resolvedDeck.id] || [],
      dateRangeStrings,
    );
  };

  const { data, error, isPending } = useQuery({
    queryFn: recommendationQuery,
    queryKey: [
      "recommendations",
      resolvedDeck?.id,
      includeSideDeck,
      isRelative,
      coreCards[resolvedDeck?.id ?? ""],
      dateRange.map(deckTickToString),
      resolvedDeck?.metaParsed.alternate_back,
      resolvedDeck?.metaParsed.alternate_front,
    ],
    retry: false,
  });

  const onKeyboardNavigate = useCallback((evt: React.KeyboardEvent) => {
    if (
      evt.key === "ArrowDown" ||
      evt.key === "ArrowUp" ||
      evt.key === "Enter" ||
      evt.key === "Escape"
    ) {
      evt.preventDefault();

      const customEvent = new CustomEvent("list-keyboard-navigate", {
        detail: evt.key,
      });

      window.dispatchEvent(customEvent);

      if (evt.key === "Escape" && evt.target instanceof HTMLElement) {
        evt.target.blur();
      }
    }
  }, []);

  if (!listState || !resolvedDeck) return null;

  const investigator = metadata.cards[resolvedDeck.investigator_code];

  return (
    <article className={cx(css["card-recommender"])} ref={ref}>
      <div className={cx(css["container"])}>
        <div className={cx(css["toolbar"])}>
          <CardSearch
            onInputKeyDown={onKeyboardNavigate}
            mode="force-hover"
            slotLeft={slotLeft}
            slotRight={slotRight}
          />
          <DeckDateRangeFilter />
          <div className={cx(css["toggle-container"])}>
            <IncludeSideDeckToggle />
            {data && <DeckCount decksAnalyzed={data?.decks_analyzed} />}
            <RecommenderRelativityToggle investigator={investigator} />
          </div>
        </div>
        {isPending && (
          <div className={css["loader-container"]}>
            <Loader show message={t("deck_edit.recommendations.loading")} />
          </div>
        )}
        {error && (
          <ErrorDisplay
            message={t("deck_edit.recommendations.error")}
            status={error instanceof ApiError ? error.status : 500}
          />
        )}
        {data && (
          <CardRecommenderInner
            {...rest}
            data={data}
            investigator={investigator}
            isRelative={isRelative}
            listState={listState}
            resolvedDeck={resolvedDeck}
          />
        )}
      </div>
      <Footer />
    </article>
  );
});

function DeckCount(props: { decksAnalyzed?: number }) {
  const { decksAnalyzed } = props;
  const { t } = useTranslation();

  if (!decksAnalyzed == null) return null;

  return (
    <span className={css["toggle-decks-count"]}>
      <i className="icon-deck" />
      {t("deck_collection.count", { count: decksAnalyzed })}
    </span>
  );
}

function CardRecommenderInner(
  props: Omit<CardListProps, "slotLeft" | "slotRight"> & {
    data: Recommendations;
    listState: ListState;
    resolvedDeck: ResolvedDeck;
    investigator: Card;
    isRelative: boolean;
  },
) {
  const {
    data,
    investigator,
    isRelative,
    quantities,
    resolvedDeck,
    listState,
    getListCardProps,
  } = props;

  const { t } = useTranslation();
  const theme = useResolvedColorTheme();

  const metadata = useStore(selectMetadata);

  const { recommendations, decks_analyzed } = data;

  const indexedRecommendations = recommendations.reduce(
    (acc, rec) => {
      acc[rec.card_code] = rec;
      return acc;
    },
    {} as Record<string, Recommendation>,
  );

  const sortedCards = listState.cards
    .filter(
      (card) =>
        indexedRecommendations[card.code] !== undefined &&
        card.xp != null &&
        indexedRecommendations[card.code].recommendation !== 0,
    )
    .sort(
      (a, b) =>
        indexedRecommendations[b.code].recommendation -
        indexedRecommendations[a.code].recommendation,
    );

  const newData: ListState = {
    cards: sortedCards,
    totalCardCount: sortedCards.length,
    groups: [],
    groupCounts: [],
    key: "recommendations",
  };

  const listCardPropsWithRecommendations = useCallback(
    (card: Card) => ({
      ...getListCardProps?.(card),
      renderCardAfter: (card: Card) => (
        <RecommendationBar
          card={card}
          decksAnalyzed={decks_analyzed}
          isRelative={isRelative}
          investigator={investigator}
          recommendations={indexedRecommendations}
        />
      ),
    }),
    [
      getListCardProps,
      decks_analyzed,
      investigator,
      indexedRecommendations,
      isRelative,
    ],
  );

  if (sortedCards.length === 0) {
    return (
      <ErrorDisplay
        message={t("deck_edit.recommendations.no_results")}
        pre={
          <img
            className={css["no-result-image"]}
            src={theme === "dark" ? "/404-dark.png" : "/404-light.png"}
            alt={t("deck_edit.recommendations.no_results")}
          />
        }
        status={404}
      />
    );
  }

  return (
    <CardList
      data={newData}
      metadata={metadata}
      resolvedDeck={resolvedDeck}
      viewMode="compact"
      listMode="single"
      quantities={quantities}
      getListCardProps={listCardPropsWithRecommendations}
    />
  );
}
