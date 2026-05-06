export const grimoireKeys = {
  all: ["grimoire"] as const,
  cardFaq: (code: string) =>
    [...grimoireKeys.all, "faq", "card", code] as const,
  cardErrata: (code: string) =>
    [...grimoireKeys.all, "errata", "card", code] as const,
};
