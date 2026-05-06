import { describe, expect } from "vitest";
import { test } from "./test-utils.ts";

describe("GET /v2/public/faq/card", () => {
  test("responds with faq for a card", async ({ dependencies }) => {
    const first = await dependencies.db
      .insertInto("faq")
      .values({
        citation: "FAQ 1.0, section 1",
        position: 2,
        question: "Second question?",
        ruling: "Second ruling.",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const second = await dependencies.db
      .insertInto("faq")
      .values({
        citation: "FAQ 1.0, section 2",
        position: 1,
        question: "First question?",
        ruling: "First ruling.",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await dependencies.db
      .insertInto("faq_card")
      .values([
        { card_id: "01001", faq_id: first.id, position: 1 },
        { card_id: "01001", faq_id: second.id, position: 1 },
      ])
      .execute();

    const res = await dependencies.app.request("/v2/public/faq/card/01001");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      {
        citation: "FAQ 1.0, section 2",
        id: second.id,
        position: 1,
        question: "First question?",
        ruling: "First ruling.",
        type: "faq",
      },
      {
        citation: "FAQ 1.0, section 1",
        id: first.id,
        position: 2,
        question: "Second question?",
        ruling: "Second ruling.",
        type: "faq",
      },
    ]);
  });

  test("responds with an empty array when no faq exists", async ({
    dependencies,
  }) => {
    const res = await dependencies.app.request("/v2/public/faq/card/01001");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

describe("GET /v2/public/errata/card", () => {
  test("responds with errata for a card", async ({ dependencies }) => {
    const errata = await dependencies.db
      .insertInto("errata")
      .values({
        citation: "FAQ 2.0",
        position: 1,
        ruling: "Updated text.",
        section: null,
        type: "card_errata",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await dependencies.db
      .insertInto("errata_card")
      .values({ card_id: "01001", errata_id: errata.id, position: 1 })
      .execute();

    const res = await dependencies.app.request("/v2/public/errata/card/01001");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      {
        citation: "FAQ 2.0",
        id: errata.id,
        position: 1,
        ruling: "Updated text.",
        section: null,
        type: "card_errata",
      },
    ]);
  });

  test("responds with an empty array when no errata exists", async ({
    dependencies,
  }) => {
    const res = await dependencies.app.request("/v2/public/errata/card/01001");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
