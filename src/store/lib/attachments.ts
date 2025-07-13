import type { Attachments } from "../schemas/card.schema";
import type { Deck } from "../slices/data.types";
import type { AttachmentQuantities } from "../slices/deck-edits.types";
import type { Metadata } from "../slices/metadata.types";

export function getAttachableCards(deck: Deck, metadata: Metadata) {
  const attachableCards: Record<string, Attachments> = {};

  const slots = {
    ...deck.slots,
    [deck.investigator_code]: 1,
  };

  for (const [code, quantity] of Object.entries(slots)) {
    if (quantity > 0) {
      const card = metadata.cards[code];
      if (card?.attachments) {
        attachableCards[code] = card.attachments;
      }
    }
  }

  return attachableCards;
}

export function clampAttachmentQuantity(
  edits: AttachmentQuantities | undefined,
  attachments: AttachmentQuantities,
  code: string,
  inDeck: number,
) {
  const next = structuredClone(edits ?? {});

  let totalCount = 0;

  for (const [targetCode, entries] of Object.entries(attachments)) {
    for (const [attachmentCode, quantity] of Object.entries(entries)) {
      if (attachmentCode === code) {
        if (quantity + totalCount >= inDeck) {
          const attached = Math.max(0, inDeck - totalCount);
          totalCount += attached;
          next[targetCode] ??= {};
          next[targetCode][attachmentCode] = attached;
        } else {
          totalCount += quantity;
        }
      }
    }
  }

  return next;
}
