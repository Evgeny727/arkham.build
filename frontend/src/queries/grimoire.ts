import { useQuery } from "@tanstack/react-query";
import { grimoireKeys } from "@/queries/keys";
import {
  queryCardErrata,
  queryCardFaq,
} from "@/store/services/requests/grimoire";

export function useCardFaqQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: grimoireKeys.cardFaq(code),
    queryFn: () => queryCardFaq(code),
    enabled,
  });
}

export function useCardErrataQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: grimoireKeys.cardErrata(code),
    queryFn: () => queryCardErrata(code),
    enabled,
  });
}
