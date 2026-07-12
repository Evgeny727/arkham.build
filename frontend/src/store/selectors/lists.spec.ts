import { beforeEach, describe, expect, it } from "vitest";
import type { StoreApi } from "zustand";
import { getMockStore } from "@/test/get-mock-store";
import type { StoreState } from "../slices";
import { selectListCards } from "./lists";

describe("selectListCards", () => {
  let store: StoreApi<StoreState>;

  beforeEach(async () => {
    store = await getMockStore();
  });

  it("includes the selected investigator when filtering by investigator access", () => {
    store.getState().setActiveList("index");

    const investigatorFilter = Object.entries(
      store.getState().lists.index.filterValues,
    ).find(([, filter]) => filter.type === "investigator");

    if (!investigatorFilter) {
      throw new Error("expected the index list to have an investigator filter");
    }

    store.getState().setFilterValue(Number(investigatorFilter[0]), "01001");

    const result = selectListCards(store.getState(), undefined, undefined);

    expect(result?.cards.map((card) => card.code)).toContain("01001");
  });

  it("includes the selected investigator when filtering with BuildQL", () => {
    store.getState().setActiveList("index");
    store.getState().setSearchValue('investigator_access = "01001"');

    const result = selectListCards(store.getState(), undefined, undefined);

    expect(result?.cards.map((card) => card.code)).toContain("01001");
  });
});
