import { z } from "zod";
import { ErrataSchema } from "../schemas/errata.schema.ts";
import { FaqSchema } from "../schemas/faq.schema.ts";
import { GlossarySchema } from "../schemas/glossary.schema.ts";

export const GrimoireResponseSchema = z.object({
  errata: z.array(ErrataSchema),
  faq: z.array(FaqSchema),
  glossary: z.array(GlossarySchema),
});

export type GrimoireResponse = z.infer<typeof GrimoireResponseSchema>;
