import type { Database } from "../../../db/db.ts";
import type { ArkhamdbDeckSnapshot } from "../../../db/schema.types.ts";

export async function createArkhamDbDeckSnapshot(
  db: Database,
  accountIdentityId: string,
  lastModified: string | null,
  decks: ArkhamdbDeckSnapshot["decks"],
) {
  return await db
    .insertInto("arkhamdb_deck_snapshot")
    .values({
      account_identity_id: accountIdentityId,
      created_at: new Date(),
      decks: JSON.stringify(decks),
      last_modified: lastModified,
    })
    .returning(["id", "created_at", "decks", "last_modified"])
    .executeTakeFirstOrThrow();
}

export async function findLatestArkhamDbDeckSnapshotByAccountIdentityId(
  db: Database,
  accountIdentityId: string,
) {
  return await db
    .selectFrom("arkhamdb_deck_snapshot")
    .select(["id", "created_at", "decks", "last_modified"])
    .where("account_identity_id", "=", accountIdentityId)
    .orderBy("created_at", "desc")
    .executeTakeFirst();
}

export async function findArkhamDbDeckSnapshotByAccountIdAndId(
  db: Database,
  accountId: string,
  snapshotId: string,
) {
  return await db
    .selectFrom("arkhamdb_deck_snapshot")
    .innerJoin(
      "account_identity",
      "account_identity.id",
      "arkhamdb_deck_snapshot.account_identity_id",
    )
    .select([
      "arkhamdb_deck_snapshot.id",
      "arkhamdb_deck_snapshot.created_at",
      "arkhamdb_deck_snapshot.decks",
      "arkhamdb_deck_snapshot.last_modified",
    ])
    .where("account_identity.account_id", "=", accountId)
    .where("account_identity.provider", "=", "arkhamdb")
    .where("arkhamdb_deck_snapshot.id", "=", snapshotId)
    .executeTakeFirst();
}

export async function deleteArkhamDbDeckSnapshotsByAccountIdentityId(
  db: Database,
  accountIdentityId: string,
) {
  await db
    .deleteFrom("arkhamdb_deck_snapshot")
    .where("account_identity_id", "=", accountIdentityId)
    .execute();
}
