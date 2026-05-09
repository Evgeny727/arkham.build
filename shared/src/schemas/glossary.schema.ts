import { z } from "zod";

export const GlossarySchema = z.object({
  type: z.literal("glossary"),
  id: z.number().int(),
  section: z.string(),
  ruling: z.string().nullish(),
  references: z.array(z.number().int()).nullish(),
  citation: z.string(),
});

export type Glossary = z.infer<typeof GlossarySchema>;
