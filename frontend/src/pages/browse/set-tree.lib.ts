import { selectCyclesAndPacks } from "@/store/selectors/lists";
import { selectLookupTables, selectMetadata } from "@/store/selectors/shared";
import type { StoreState } from "@/store/slices";
import { official } from "@/utils/card-utils";
import type { ChapterTab } from "./set-tree";

export function selectInitialChapterTab(
  state: StoreState,
  activeCode: string | undefined,
  activeType: "cycle" | "pack" | "encounter_set" | "none" | undefined,
): ChapterTab | undefined {
  if (!activeCode || !activeType || activeType === "none") return undefined;

  if (activeType === "cycle") {
    const cycle = selectCyclesAndPacks(state).find(
      (c) => c.code === activeCode,
    );
    if (!cycle) return undefined;
    return official(cycle)
      ? ((cycle.packs[0]?.chapter ?? 1).toString() as ChapterTab)
      : "fan-made";
  }

  const metadata = selectMetadata(state);

  if (activeType === "pack") {
    const pack = metadata.packs[activeCode];
    if (!pack) return undefined;
    return official(pack)
      ? ((pack.chapter ?? 1).toString() as ChapterTab)
      : "fan-made";
  }

  if (activeType === "encounter_set") {
    const lookupTables = selectLookupTables(state);
    const packCode = Object.keys(lookupTables.encounterCodesByPack).find(
      (p) => lookupTables.encounterCodesByPack[p]?.[activeCode],
    );
    const pack = packCode ? metadata.packs[packCode] : undefined;
    if (!pack) return undefined;
    return official(pack)
      ? ((pack.chapter ?? 1).toString() as ChapterTab)
      : "fan-made";
  }

  return undefined;
}
