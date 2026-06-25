import type { Context } from "hono";
import type { z } from "zod";
import type { HonoEnv } from "../../hono-env.ts";
import { mergeAdditionalMeta } from "../additional-metadata.ts";
import {
  type ArkhamDbRemoteDeck,
  ArkhamDbRemoteDeckSchema,
} from "./core/dtos.ts";
import { request, type WrappedResponse } from "./core/request.ts";
import {
  isArkhamDbDeckId,
  mapArkhamDbDecklistRowToRemoteDeck,
} from "./mapping.ts";

export async function fetchDeck(
  c: Context<HonoEnv>,
  query: { id: string | number; type: string },
): Promise<WrappedResponse<ArkhamDbRemoteDeck>> {
  const response =
    (await fetchCachedDecklist(c, query)) ??
    (await publicRequest(
      c,
      `/${query.type}/${query.id}`,
      ArkhamDbRemoteDeckSchema,
    ));

  return {
    ...response,
    data: await mergeAdditionalMeta(c.get("db"), response.data, {
      legacyApiBaseUrl: c.get("config").LEGACY_API_BASE_URL,
    }),
  };
}

export async function fetchDeckHistory(
  c: Context<HonoEnv>,
  id: string | number,
): Promise<ArkhamDbRemoteDeck[]> {
  const { data: deck } = await fetchDeck(c, { id, type: "deck" });

  const [nextDecks, previousDecks] = await Promise.all([
    fetchSurroundingDeck(c, deck, "next_deck"),
    fetchSurroundingDeck(c, deck, "previous_deck"),
  ]);

  return [...nextDecks.reverse(), deck, ...previousDecks];
}

async function fetchCachedDecklist(
  c: Context<HonoEnv>,
  query: { id: string | number; type: string },
): Promise<WrappedResponse<ArkhamDbRemoteDeck> | undefined> {
  if (query.type !== "decklist" || !isArkhamDbDeckId(query.id)) {
    return undefined;
  }

  const decklist = await c
    .get("db")
    .selectFrom("arkhamdb_decklist")
    .selectAll()
    .where("id", "=", Number(query.id))
    .executeTakeFirst();

  if (!decklist) return undefined;

  return {
    data: mapArkhamDbDecklistRowToRemoteDeck(decklist),
    headers: {},
    status: 200,
  };
}

async function fetchSurroundingDeck(
  c: Context<HonoEnv>,
  deck: ArkhamDbRemoteDeck,
  idKey: "next_deck" | "previous_deck",
  decks: ArkhamDbRemoteDeck[] = [],
): Promise<ArkhamDbRemoteDeck[]> {
  if (!deck[idKey]) {
    return Promise.resolve(decks);
  }

  const { data } = await fetchDeck(c, {
    id: deck[idKey] as string | number,
    type: "deck",
  });

  decks.push(data);

  return fetchSurroundingDeck(c, data, idKey, decks);
}

async function publicRequest<T>(
  c: Context<HonoEnv>,
  path: string,
  schema: z.ZodType<T>,
): Promise<WrappedResponse<T>> {
  const response = await request<unknown>(c, `/api/public${path}`, {
    headers: {
      "X-Forwarded-For": c.req.header("CF-Connecting-IP") ?? "",
    },
  });

  return {
    ...response,
    data: schema.parse(response.data),
  };
}
