import { describe, expect } from "vitest";
import { test } from "./test-utils.ts";

type TabooSetsWithCardsResponse = {
  data: {
    taboo_set: {
      cards: Record<string, unknown>[];
    }[];
  };
};

describe("GET /v1/cache", () => {
  test("returns 304 for matching etags", async ({ dependencies }) => {
    const initialRes = await dependencies.app.request("/v1/cache/metadata");
    const etag = initialRes.headers.get("ETag");

    expect(etag).toBeTruthy();

    const res = await dependencies.app.request("/v1/cache/metadata", {
      headers: {
        // biome-ignore lint/style/noNonNullAssertion: test code.
        "If-None-Match": etag!,
      },
    });

    expect(res.status).toBe(304);
    expect(res.headers.get("ETag")).toBe(etag);
    expect(await res.text()).toBe("");
  });

  test("returns compact taboo set cards", async ({ dependencies }) => {
    const res = await dependencies.app.request(
      "/v1/cache/taboo_sets_with_cards",
    );
    const json = (await res.json()) as TabooSetsWithCardsResponse;
    const firstCard = json.data.taboo_set[0]?.cards[0];

    expect(firstCard).toBeTruthy();
    expect(Object.keys(firstCard ?? {}).sort()).toEqual(["code", "real_name"]);
  });
});
