"use server";

import {
  getDeckNames,
  getNextCard,
  updateCard as updateCardService,
  getDeckStats,
  type AnkiCard,
  type AnkiDeckStats,
} from "@/lib/anki-service";
import { revalidatePath } from "next/cache";

// Re-export types for convenience
export type { AnkiCard, AnkiDeckStats };

export interface AnkiError {
  error: string;
}

// Server action to get all decks
export async function getDecks(): Promise<{ decks: string[] } | AnkiError> {
  try {
    const decks = await getDeckNames();
    return { decks };
  } catch (error) {
    return { error: `Error fetching decks: ${error}` };
  }
}

// Server action to get the next card from a deck
export async function getNextCardAction(
  deckName: string
): Promise<{ card: AnkiCard } | AnkiError> {
  try {
    const card = await getNextCard(deckName);
    return { card };
  } catch (error) {
    return { error: `Error fetching next card: ${error}` };
  }
}

// Server action to update a card's rating
export async function updateCardAction(
  cardId: string,
  rating: number
): Promise<{ card: AnkiCard } | AnkiError> {
  try {
    const card = await updateCardService(cardId, rating);

    // Revalidate any cached data that might depend on this card
    revalidatePath("/review");

    return { card };
  } catch (error) {
    return { error: `Error updating card: ${error}` };
  }
}

// Server action to get deck statistics
export async function getDeckStatsAction(
  deckName: string
): Promise<{ stats: AnkiDeckStats } | AnkiError> {
  try {
    const stats = await getDeckStats(deckName);
    return { stats };
  } catch (error) {
    return { error: `Error fetching deck stats: ${error}` };
  }
}
