import type { JsonDataGlossary } from "@arkham-build/shared";

export function resolveGlossaryEntries(glossary: JsonDataGlossary[]) {
  return glossary.map((entry) => ({
    ...entry,
    translations: [],
  }));
}

export function resolveGlossaryEntryReferences(glossary: JsonDataGlossary[]) {
  return glossary.flatMap((entry) =>
    [...new Set(entry.references ?? [])].map((targetEntryId, index) => ({
      source_entry_id: entry.entry_id,
      target_entry_id: targetEntryId,
      position: index + 1,
    })),
  );
}
