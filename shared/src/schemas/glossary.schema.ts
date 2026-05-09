import { z } from "zod";

export const JsonDataGlossarySchema = z.object({
  type: z.literal("glossary"),
  entry_id: z.number().int(),
  section: z.string(),
  ruling: z.string().nullish(),
  references: z.array(z.number().int()).nullish(),
  citation: z.string(),
});

export type JsonDataGlossary = z.infer<typeof JsonDataGlossarySchema>;
