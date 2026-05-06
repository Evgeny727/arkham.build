import type { Selectable } from "kysely";
import type { Database } from "../db.ts";
import type { Errata, Faq } from "../schema.types.ts";

export function getFaqForCard(
  db: Database,
  cardCode: string,
): Promise<Selectable<Faq>[]> {
  return db
    .selectFrom("faq")
    .innerJoin("faq_card", "faq.id", "faq_card.faq_id")
    .select([
      "faq.citation",
      "faq.id",
      "faq.position",
      "faq.question",
      "faq.ruling",
      "faq.type",
    ])
    .where("faq_card.card_id", "=", cardCode)
    .orderBy("faq.position")
    .orderBy("faq_card.position")
    .execute();
}

export function getErrataForCard(
  db: Database,
  cardCode: string,
): Promise<Selectable<Errata>[]> {
  return db
    .selectFrom("errata")
    .innerJoin("errata_card", "errata.id", "errata_card.errata_id")
    .select([
      "errata.citation",
      "errata.id",
      "errata.position",
      "errata.ruling",
      "errata.section",
      "errata.type",
    ])
    .where("errata_card.card_id", "=", cardCode)
    .orderBy("errata.position")
    .orderBy("errata_card.position")
    .execute();
}
