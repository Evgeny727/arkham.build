import type { Glossary } from "@arkham-build/shared";

export function resolveGlossaryEntries(glossary: Glossary[]) {
  return glossary.map((entry) => ({
    id: entry.id,
    section: entry.section,
    ruling: entry.ruling,
    translations: [],
    citation: entry.citation,
  }));
}

export function resolveGlossaryEntryReferences(glossary: Glossary[]) {
  return glossary.flatMap((entry) =>
    [...new Set(entry.references ?? [])].map((targetEntryId, index) => ({
      source_id: entry.id,
      target_id: targetEntryId,
      position: index + 1,
    })),
  );
}
