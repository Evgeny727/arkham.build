import type { Pack } from "../schemas/pack.schema";

export function inferCardChapter(
  packCode: string,
  packs: Record<string, Pack>,
) {
  return packs[packCode]?.chapter ?? 1;
}
