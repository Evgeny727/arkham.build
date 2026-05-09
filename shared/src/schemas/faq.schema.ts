import { z } from "zod";

export const FaqSchema = z.object({
  type: z.literal("faq"),
  card_codes: z.array(z.string()).nullish(),
  cycles: z.array(z.string()).nullish(),
  scenario_codes: z.array(z.string()).nullish(),
  question: z.string(),
  ruling: z.string(),
  citation: z.string(),
});

export type Faq = z.infer<typeof FaqSchema>;
