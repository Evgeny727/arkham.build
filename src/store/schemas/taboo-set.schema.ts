import * as z from "zod/v4-mini";

const TabooSetSchema = z.object({
  card_count: z.number(),
  date: z.string(),
  id: z.number(),
  name: z.string(),
});

export type TabooSet = z.infer<typeof TabooSetSchema>;
