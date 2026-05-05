import { z } from "zod";

export const JsonDataCampaignSchema = z.object({
  code: z.string(),
  name: z.string(),
  pack_codes: z.array(z.string()).nullish(),
  scenarios: z.array(z.string()),
});

export type JsonDataCampaign = z.infer<typeof JsonDataCampaignSchema>;
