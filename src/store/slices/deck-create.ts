import type { StateCreator } from "zustand";
import { assert } from "@/utils/assert";
import { displayAttribute, getCanonicalCardCode } from "@/utils/card-utils";
import { getDefaultDeckName } from "../lib/deck-factory";
import { selectConnectionsData } from "../selectors/connections";
import { selectMetadata } from "../selectors/shared";
import type { StoreState } from ".";
import type { CardSet, DeckCreateSlice } from "./deck-create.types";
import type { Metadata } from "./metadata.types";

export const createDeckCreateSlice: StateCreator<
  StoreState,
  [],
  [],
  DeckCreateSlice
> = (set) => ({
  deckCreate: undefined,

  initCreate(code: string, initialInvestigatorChoice?: string) {
    set((state) => {
      const metadata = selectMetadata(state);
      const settings = state.settings;
      const connections = selectConnectionsData(state);

      const investigator = metadata.cards[code];
      assert(
        investigator && investigator.type_code === "investigator",
        "Deck configure must be initialized with an investigator card.",
      );

      const canonicalCode = getCanonicalCardCode(investigator);

      const choice = initialInvestigatorChoice
        ? metadata.cards[initialInvestigatorChoice]
        : undefined;

      if (initialInvestigatorChoice) {
        assert(
          choice && choice.type_code === "investigator",
          "Deck configure must be initialized with an investigator card.",
        );

        assert(
          choice.real_name === investigator.real_name,
          "Parallel investigator must have the same real name as the investigator.",
        );
      }

      const provider = settings.defaultStorageProvider;

      // when arkhamdb is set as default storage, but not available, default to local.
      const providerExists =
        provider !== "arkhamdb" ||
        connections.some((c) => c.provider === provider);

      const tabooSetId: number | undefined =
        state.settings.tabooSetId === "latest"
          ? latestTabooSetId(metadata)
          : state.settings.tabooSetId;

      return {
        deckCreate: {
          extraCardQuantities: {},
          investigatorBackCode: choice ? choice.code : canonicalCode,
          investigatorCode: canonicalCode,
          investigatorFrontCode: choice ? choice.code : canonicalCode,
          provider: providerExists ? provider : "local",
          selections: {},
          sets: ["requiredCards"],
          tabooSetId,
          title: getDefaultDeckName(
            displayAttribute(investigator, "name"),
            investigator.faction_code,
          ),
        },
      };
    });
  },

  resetCreate() {
    set({
      deckCreate: undefined,
    });
  },

  deckCreateSetTitle(value: string) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");

      return {
        deckCreate: {
          ...state.deckCreate,
          title: value,
        },
      };
    });
  },

  deckCreateSetTabooSet(value: number | undefined) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");

      return {
        deckCreate: {
          ...state.deckCreate,
          tabooSetId: value,
        },
      };
    });
  },

  deckCreateSetInvestigatorCode(value: string, side?: "front" | "back") {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");

      if (!side) {
        return {
          deckCreate: {
            ...state.deckCreate,
            investigatorCode: value,
            investigatorFrontCode: value,
            investigatorBackCode: value,
          },
        };
      }

      const path =
        side === "front" ? "investigatorFrontCode" : "investigatorBackCode";

      return {
        deckCreate: {
          ...state.deckCreate,
          [path]: value,
        },
      };
    });
  },

  deckCreateSetSelection(key, value) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");

      return {
        deckCreate: {
          ...state.deckCreate,
          selections: {
            ...state.deckCreate.selections,
            [key]: value,
          },
        },
      };
    });
  },

  deckCreateToggleCardSet(value) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");
      assert(isCardSet(value), "Invalid card set value.");

      const nextSets: CardSet[] = state.deckCreate.sets.filter((set) => {
        const mutuallyExclusive =
          (set === "advanced" && value === "requiredCards") ||
          (set === "requiredCards" && value === "advanced");

        return !mutuallyExclusive;
      });

      return {
        deckCreate: {
          ...state.deckCreate,
          sets: nextSets.includes(value)
            ? nextSets.filter((set) => set !== value)
            : [...nextSets, value],
        },
      };
    });
  },

  deckCreateChangeExtraCardQuantity(card, quantity) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");

      const currentQuantity =
        state.deckCreate.extraCardQuantities[card.code] ?? card.quantity;

      return {
        deckCreate: {
          ...state.deckCreate,
          extraCardQuantities: {
            ...state.deckCreate.extraCardQuantities,
            [card.code]: currentQuantity + quantity,
          },
        },
      };
    });
  },
  deckCreateSetCardPool(value) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");
      return {
        deckCreate: {
          ...state.deckCreate,
          cardPool: value,
        },
      };
    });
  },
  deckCreateSetSealed(sealed) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");
      return {
        deckCreate: {
          ...state.deckCreate,
          sealed,
        },
      };
    });
  },
  deckCreateSetProvider(provider) {
    set((state) => {
      assert(state.deckCreate, "DeckCreate slice must be initialized.");
      return {
        deckCreate: {
          ...state.deckCreate,
          provider,
        },
      };
    });
  },
});

function isCardSet(value: string): value is CardSet {
  return (
    value === "requiredCards" || value === "advanced" || value === "replacement"
  );
}

function latestTabooSetId(metadata: Metadata) {
  const id = Object.keys(metadata.tabooSets)
    .sort((a, b) => +a - +b) // INVARIANT: taboo set ids are integers
    .pop();
  return id ? +id : undefined;
}
