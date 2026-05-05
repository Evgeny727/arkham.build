import { z } from "zod";

export const JsonDataErrataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("campaign_errata"),
    cycles: z.array(z.string()),
    scenario_codes: z.array(z.string()).nullish(),
    ruling: z.string(),
    citation: z.string(),
  }),
  z.object({
    type: z.literal("card_errata"),
    card_codes: z.array(z.string()),
    ruling: z.string(),
    citation: z.string(),
  }),
  z.object({
    type: z.literal("rulebook_errata"),
    section: z.string(),
    ruling: z.string(),
    citation: z.string(),
  }),
]);

export type JsonDataErrata = z.infer<typeof JsonDataErrataSchema>;
