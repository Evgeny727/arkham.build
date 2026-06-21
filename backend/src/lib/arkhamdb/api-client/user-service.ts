import assert from "node:assert";
import type {
  Deck,
  DeckId,
  DeckManifestItem,
  DeckWritePayload,
} from "@arkham-build/shared";
import type { Context } from "hono";
import { z } from "zod";
import { getAccountIdentityByAccountIdAndProvider } from "../../auth/account-identities.ts";
import type { SessionAuthHonoEnv } from "../../hono-env.ts";
import {
  createDeck,
  deleteDeck,
  fetchDeck,
  saveDeck,
  syncDecks,
  upgradeDeck,
} from "./api-user.ts";
import {
  type ArkhamDbRemoteDeck,
  ArkhamDbRemoteDeckSchema,
  ArkhamDbRemoteDecksSchema,
} from "./core/dtos.ts";
import {
  createArkhamDbDeckSnapshot,
  deleteArkhamDbDeckSnapshotsByAccountIdentityId,
  findArkhamDbDeckSnapshotByAccountIdAndId,
  findLatestArkhamDbDeckSnapshotByAccountIdentityId,
} from "./deck-snapshots.ts";
import { mapArkhamDbDeckToDto } from "./mapping.ts";

export async function fetchArkhamDbDeck(
  c: Context<SessionAuthHonoEnv>,
  id: string | number,
) {
  const response = await fetchDeck(c, id);
  return mapArkhamDbDeckToDto(response.data);
}

export async function fetchArkhamDbDeckBatch(
  c: Context<SessionAuthHonoEnv>,
  ids: DeckId[],
  arkhamdbSyncToken?: string,
) {
  const snapshot = arkhamdbSyncToken
    ? await findArkhamDbDeckSnapshotByAccountIdAndId(
        c.get("db"),
        c.get("account").id,
        arkhamdbSyncToken,
      )
    : undefined;

  if (!arkhamdbSyncToken) {
    const decks: Deck[] = [];

    for (const id of ids) {
      decks.push(await fetchArkhamDbDeck(c, id));
    }

    return decks;
  }

  const snapshotDecks = ArkhamDbRemoteDecksSchema.parse(snapshot?.decks ?? []);

  const snapshotDecksById = new Map(
    snapshotDecks.map((deck) => [String(deck.id), deck]),
  );

  const decks: Deck[] = [];

  for (const id of ids) {
    const snapshotDeck = snapshotDecksById.get(String(id));

    if (!snapshotDeck) {
      throw new Error(`Deck ${id} not found in snapshot.`);
    }

    decks.push(mapArkhamDbDeckToDto(snapshotDeck));
  }

  return decks;
}

export async function fetchArkhamDbDeckManifest(
  c: Context<SessionAuthHonoEnv>,
): Promise<{ arkhamdbSyncToken: string; decks: DeckManifestItem[] }> {
  const db = c.get("db");
  const accountId = c.get("account").id;

  const identity = await getAccountIdentityByAccountIdAndProvider(
    db,
    accountId,
    "arkhamdb",
  );

  assert(identity, "Missing ArkhamDB identity for account.");

  const snapshot = await findLatestArkhamDbDeckSnapshotByAccountIdentityId(
    db,
    identity.id,
  );

  const syncedAt = new Date();

  const response = await syncDecks(
    c,
    syncedAt,
    snapshot?.last_modified ?? null,
  );

  if (response.status === 200) {
    assert(response.data, "Missing deck data for successful sync.");

    const createdSnapshot = await createArkhamDbDeckSnapshot(
      db,
      identity.id,
      response.headers["last-modified"] ?? null,
      response.data,
    );
    return {
      arkhamdbSyncToken: createdSnapshot.id,
      decks: response.data.map(mapArkhamDbDeckToManifestItem),
    };
  }

  assert(snapshot, "Missing ArkhamDB snapshot for 304 response.");

  const remoteDecks = ArkhamDbRemoteDeckManifestSourcesSchema.parse(
    snapshot.decks,
  );

  return {
    arkhamdbSyncToken: snapshot.id,
    decks: remoteDecks.map(mapArkhamDbDeckToManifestItem),
  };
}

export async function saveArkhamDbDeck(
  c: Context<SessionAuthHonoEnv>,
  id: string | number,
  deck: DeckWritePayload,
): Promise<Deck> {
  const response = await saveDeck(c, id, deck);
  await invalidateArkhamDbDeckSnapshots(c);
  return {
    ...mapArkhamDbDeckToDto(response.data),
    xp: response.data.xp ?? deck.xp ?? null,
  };
}

export async function createArkhamDbDeck(
  c: Context<SessionAuthHonoEnv>,
  deck: DeckWritePayload,
): Promise<Deck> {
  const response = await createDeck(c, deck);
  await invalidateArkhamDbDeckSnapshots(c);
  return {
    ...mapArkhamDbDeckToDto(response.data),
    xp: response.data.xp ?? deck.xp ?? null,
  };
}

export async function upgradeArkhamDbDeck(
  c: Context<SessionAuthHonoEnv>,
  id: string | number,
  deck: DeckWritePayload,
): Promise<Deck> {
  const response = await upgradeDeck(c, id, deck);
  await invalidateArkhamDbDeckSnapshots(c);
  return {
    ...mapArkhamDbDeckToDto(response.data),
    xp: response.data.xp ?? 0,
  };
}

export async function deleteArkhamDbDeck(
  c: Context<SessionAuthHonoEnv>,
  deckId: string | number,
  all?: boolean,
) {
  await deleteDeck(c, deckId, all);
  await invalidateArkhamDbDeckSnapshots(c);
}

const ArkhamDbRemoteDeckManifestSourceSchema = ArkhamDbRemoteDeckSchema.pick({
  date_creation: true,
  date_update: true,
  id: true,
  version: true,
});
const ArkhamDbRemoteDeckManifestSourcesSchema = z.array(
  ArkhamDbRemoteDeckManifestSourceSchema,
);

type ArkhamDbRemoteDeckManifestSource = Pick<
  ArkhamDbRemoteDeck,
  "date_creation" | "date_update" | "id" | "version"
>;

function mapArkhamDbDeckToManifestItem(
  deck: ArkhamDbRemoteDeckManifestSource,
): DeckManifestItem {
  return {
    provider: "arkhamdb",
    id: deck.id,
    updatedAt: toArkhamDbDeckTimestamp(deck.date_update, deck.date_creation),
    version: deck.version,
  };
}

function toArkhamDbDeckTimestamp(
  primary: string | null | undefined,
  fallback: string | null | undefined,
) {
  return primary ?? fallback ?? new Date().toISOString();
}

async function invalidateArkhamDbDeckSnapshots(c: Context<SessionAuthHonoEnv>) {
  const identity = await getAccountIdentityByAccountIdAndProvider(
    c.get("db"),
    c.get("account").id,
    "arkhamdb",
  );

  assert(identity, "Missing ArkhamDB identity for account.");

  await deleteArkhamDbDeckSnapshotsByAccountIdentityId(
    c.get("db"),
    identity.id,
  );
}
