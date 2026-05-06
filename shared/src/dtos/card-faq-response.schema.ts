import { z } from "zod";

export const CardFaqSchema = z.object({
  citation: z.string(),
  id: z.number(),
  position: z.number(),
  question: z.string(),
  ruling: z.string(),
  type: z.literal("faq"),
});

export const CardFaqResponseSchema = z.array(CardFaqSchema);

export type CardFaq = z.infer<typeof CardFaqSchema>;

export type CardFaqResponse = z.infer<typeof CardFaqResponseSchema>;
