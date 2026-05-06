import {
  type CardErrataResponse,
  CardErrataResponseSchema,
  type CardFaqResponse,
  CardFaqResponseSchema,
} from "@arkham-build/shared";
import { apiV2Request } from "./shared";

export async function queryCardFaq(cardCode: string): Promise<CardFaqResponse> {
  const res = await apiV2Request(`/v2/public/faq/card/${cardCode}`);
  const data = await res.json();
  return CardFaqResponseSchema.parse(data);
}

export async function queryCardErrata(
  cardCode: string,
): Promise<CardErrataResponse> {
  const res = await apiV2Request(`/v2/public/errata/card/${cardCode}`);
  const data = await res.json();
  return CardErrataResponseSchema.parse(data);
}
