import { z } from "zod";

export const CardErrataSchema = z.object({
  citation: z.string(),
  id: z.number(),
  position: z.number(),
  ruling: z.string(),
  section: z.string().nullable(),
  type: z.literal("card_errata"),
});

export const CardErrataResponseSchema = z.array(CardErrataSchema);

export type CardErrata = z.infer<typeof CardErrataSchema>;

export type CardErrataResponse = z.infer<typeof CardErrataResponseSchema>;
