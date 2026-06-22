import { describe, expect, vi } from "vitest";
import { mergeAdditionalMeta } from "../lib/arkhamdb/additional-metadata.ts";
import type { ArkhamDbRemoteDeck } from "../lib/arkhamdb/api-client/core/dtos.ts";
import { test } from "./test-utils.ts";

describe("GET /v1/public/additional_metadata/:id", () => {
  test("returns additional metadata by id", async ({ dependencies }) => {
    const { app, db } = dependencies;
    const data = {
      fan_made_content: ["fan-made-project"],
      hidden_slots: { "01001": 1 },
    };

    const row = await db
      .insertInto("arkhamdb_deck_additional_metadata")
      .values({
        data,
        deck_id: 123,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    const res = await app.request(`/v2/public/additional_metadata/${row.id}`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(data);
  });

  test("returns 404 when additional metadata is not found", async ({
    dependencies,
  }) => {
    const { app } = dependencies;

    const res = await app.request("/v1/public/additional_metadata/missing");

    expect(res.status).toBe(404);
  });

  test("loads stale amk refs from the legacy API while merging deck metadata", async ({
    dependencies,
  }) => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ hidden_slots: { slots: { "01001": 1 } } }),
        {
          status: 200,
        },
      ),
    );

    const deck = await mergeAdditionalMeta(
      dependencies.db,
      makeRemoteDeck({ meta: JSON.stringify({ amk: "missing", foo: "bar" }) }),
      { legacyApiBaseUrl: dependencies.config.LEGACY_API_BASE_URL },
    );

    expect(fetch).toHaveBeenCalledWith(
      new URL(
        "/v1/public/additional_metadata/missing",
        dependencies.config.LEGACY_API_BASE_URL,
      ),
      expect.objectContaining({
        headers: { accept: "application/json" },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(deck.slots).toEqual({ "01001": 1, "01006": 1 });
    expect(JSON.parse(deck.meta)).toEqual({
      foo: "bar",
      hidden_slots: { slots: { "01001": 1 } },
    });

    fetch.mockRestore();
  });
});

function makeRemoteDeck(overrides: Partial<ArkhamDbRemoteDeck>) {
  return {
    date_creation: "2026-01-01T00:00:00.000Z",
    date_update: "2026-01-01T00:00:00.000Z",
    description_md: "",
    exile_string: null,
    id: 123,
    ignoreDeckLimitSlots: null,
    investigator_code: "01001",
    investigator_name: "Roland Banks",
    meta: "{}",
    name: "Remote Deck",
    next_deck: null,
    previous_deck: null,
    problem: null,
    sideSlots: null,
    slots: { "01006": 1 },
    taboo: null,
    tags: "",
    user_id: 1,
    version: "1.0",
    xp: null,
    xp_adjustment: null,
    xp_spent: null,
    ...overrides,
  } satisfies ArkhamDbRemoteDeck;
}
