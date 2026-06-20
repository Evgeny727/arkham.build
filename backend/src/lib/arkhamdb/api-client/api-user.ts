import assert from "node:assert";
import { type DeckWritePayload, SlotsSchema } from "@arkham-build/shared";
import type { Context } from "hono";
import type { SessionAuthHonoEnv } from "../../hono-env.ts";
import {
  mergeAdditionalMeta,
  storeAdditionalMetadata,
} from "../additional-metadata.ts";
import { extractHiddenSlots } from "../hidden-slots.ts";
import {
  ArkhamDbOperationResponseSchema,
  type ArkhamDbRemoteDeck,
  ArkhamDbRemoteDeckSchema,
  ArkhamDbRemoteDecksSchema,
  ArkhamDbSuccessResponseSchema,
} from "./core/dtos.ts";
import { ApiError } from "./core/errors.ts";
import {
  type ArkhamDbExecutor,
  withArkhamDbExecutor,
} from "./core/execute-with-lock.ts";

export function fetchDeck(c: Context<SessionAuthHonoEnv>, id: string | number) {
  return withArkhamDbExecutor(c, async (executor) => {
    const response = await executor.request(
      `/deck/load/${id}`,
      ArkhamDbRemoteDeckSchema,
    );

    return {
      ...response,
      data: await mergeAdditionalMeta(executor.db, response.data),
    };
  });
}

export function syncDecks(
  c: Context<SessionAuthHonoEnv>,
  syncedAt = new Date(),
  ifModifiedSince?: string | null,
) {
  return withArkhamDbExecutor(c, async (executor) => {
    try {
      const headers =
        typeof ifModifiedSince === "string"
          ? {
              "If-Modified-Since": ifModifiedSince,
            }
          : {};

      const response = await executor.request(
        "/decks",
        ArkhamDbRemoteDecksSchema,
        { headers },
        (error) => {
          if (error.status !== 304) return;

          return {
            data: undefined,
            headers,
            status: 304,
          };
        },
      );

      await executor.patchIdentityState({
        lastError: null,
        lastSyncedAt: syncedAt.toISOString(),
        status: "healthy",
      });

      if (response.status !== 200) {
        return response;
      }

      assert(response.data, "Missing deck data for successful sync.");

      return {
        ...response,
        data: await mergeAdditionalMetadataForDecks(executor.db, response.data),
      };
    } catch (error) {
      await executor.patchIdentityFailure(error);
      throw error;
    }
  });
}

export function saveDeck(
  c: Context<SessionAuthHonoEnv>,
  id: string | number,
  deck: DeckWritePayload,
) {
  return withArkhamDbExecutor(c, async (executor) => {
    const storedDeck = await storeAdditionalMetadata(executor.db, id, deck);

    const { data: operation } = await executor.request(
      `/deck/save/${id}`,
      ArkhamDbOperationResponseSchema,
      {
        method: "PUT",
        body: encodeParams({
          description_md: storedDeck.description_md,
          exile_string: storedDeck.exile_string ?? undefined,
          ignored: stringifyOptionalSlots(storedDeck.ignoreDeckLimitSlots),
          meta: storedDeck.meta,
          name: storedDeck.name,
          problem: storedDeck.problem,
          side: stringifyOptionalSlots(storedDeck.sideSlots),
          slots: JSON.stringify(SlotsSchema.parse(storedDeck.slots)),
          taboo: storedDeck.taboo_id ?? undefined,
          tags: storedDeck.tags,
          xp_adjustment: storedDeck.xp_adjustment ?? undefined,
          xp_spent: storedDeck.xp_spent ?? undefined,
        }),
      },
    );

    assertSuccessfulOperation(operation);
    return await loadDeck(executor, operation.msg);
  });
}

export function createDeck(
  c: Context<SessionAuthHonoEnv>,
  _deck: DeckWritePayload,
) {
  return withArkhamDbExecutor(c, async (executor) => {
    const deck = { ..._deck };
    extractHiddenSlots(deck);

    const { data: operation } = await executor.request(
      "/deck/new",
      ArkhamDbOperationResponseSchema,
      {
        method: "POST",
        body: encodeParams({
          investigator: deck.investigator_code,
          name: deck.name,
          taboo: deck.taboo_id ?? undefined,
        }),
      },
    );

    assertSuccessfulOperation(operation);

    const storedDeck = await storeAdditionalMetadata(
      executor.db,
      operation.msg,
      deck,
    );

    const { data: saveOperation } = await executor.request(
      `/deck/save/${operation.msg}`,
      ArkhamDbOperationResponseSchema,
      {
        method: "PUT",
        body: encodeParams({
          description_md: storedDeck.description_md,
          exile_string: storedDeck.exile_string ?? undefined,
          ignored: stringifyOptionalSlots(storedDeck.ignoreDeckLimitSlots),
          meta: storedDeck.meta,
          name: storedDeck.name,
          problem: storedDeck.problem,
          side: stringifyOptionalSlots(storedDeck.sideSlots),
          slots: JSON.stringify(SlotsSchema.parse(storedDeck.slots)),
          taboo: storedDeck.taboo_id ?? undefined,
          tags: storedDeck.tags,
          xp_adjustment: storedDeck.xp_adjustment ?? undefined,
          xp_spent: storedDeck.xp_spent ?? undefined,
        }),
      },
    );

    assertSuccessfulOperation(saveOperation);
    return await loadDeck(executor, saveOperation.msg);
  });
}

export function upgradeDeck(
  c: Context<SessionAuthHonoEnv>,
  id: string | number,
  _deck: DeckWritePayload,
) {
  return withArkhamDbExecutor(c, async (executor) => {
    const deck = { ..._deck };
    extractHiddenSlots(deck);

    const { data: operation } = await executor.request(
      `/deck/upgrade/${id}`,
      ArkhamDbOperationResponseSchema,
      {
        method: "PUT",
        body: encodeParams({
          exiles: deck.exile_string ?? undefined,
          meta: deck.meta,
          xp: deck.xp ?? 0,
        }),
      },
    );

    assertSuccessfulOperation(operation);
    return await loadDeck(executor, operation.msg);
  });
}

export function deleteDeck(
  c: Context<SessionAuthHonoEnv>,
  deckId: string | number,
  all?: boolean,
) {
  return withArkhamDbExecutor(c, async (executor) => {
    const path = `/deck/delete/${deckId}`;
    const { data: operation } = await executor.request(
      all ? `${path}?all=true` : path,
      ArkhamDbSuccessResponseSchema,
      {
        method: "DELETE",
      },
    );

    assertSuccessfulOperation(operation);
  });
}

async function loadDeck(executor: ArkhamDbExecutor, id: string | number) {
  const response = await executor.request(
    `/deck/load/${id}`,
    ArkhamDbRemoteDeckSchema,
  );

  return {
    ...response,
    data: await mergeAdditionalMeta(executor.db, response.data),
  };
}

async function mergeAdditionalMetadataForDecks(
  db: ArkhamDbExecutor["db"],
  decks: ArkhamDbRemoteDeck[],
) {
  return await Promise.all(decks.map((deck) => mergeAdditionalMeta(db, deck)));
}

function stringifyOptionalSlots(
  value: Record<string, number> | null | undefined,
) {
  return value == null ? undefined : JSON.stringify(SlotsSchema.parse(value));
}

function encodeParams(data: Record<string, unknown>) {
  const payload = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        payload.append(key, item.toString());
      }
    } else {
      payload.append(key, value.toString());
    }
  }

  return new URLSearchParams(payload).toString();
}

function assertSuccessfulOperation(res: {
  success: boolean;
  msg?: string | number | null | undefined;
}) {
  if (!res.success) {
    throw new ApiError(res.msg?.toString() ?? "Unknown operation error.", 500);
  }
}
