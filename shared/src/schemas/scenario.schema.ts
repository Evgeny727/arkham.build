import { z } from "zod";

export const JsonDataScenarioSchema = z.object({
  name: z.string(),
  scenario_code: z.string(),
  campaign_code: z.string(),
  encounter_codes: z.array(z.string()),
  extra_cards: z.array(z.string()).nullish(),
});

export type JsonDataScenario = z.infer<typeof JsonDataScenarioSchema>;
