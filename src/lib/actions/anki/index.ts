"use server";

import { ankiConnectRequest as ankiService } from "@/lib/anki-service";
import { revalidatePath } from "next/cache";

// Types for Anki operations
export interface AnkiDeck {
  name: string;
  id: string;
}

export interface AnkiCard {
  id: string;
  front: string;
  back: string;
  deckName: string;
}

export interface AnkiError {
  error: string;
}

// TODO: add a proper type for AnkiDeckStats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnkiDeckStats = any;

// Server action to get the next card from a deck
export async function getNextCard(
  deckName: string
): Promise<{ card: AnkiCard } | AnkiError> {
  try {
    const result = await ankiService("getNextCard", { deckName });
    return { card: result };
  } catch (error) {
    return { error: `Error fetching next card: ${error}` };
  }
}

// Server action to update a card's rating
export async function updateCard(
  cardId: string,
  rating: number
): Promise<{ card: AnkiCard } | AnkiError> {
  try {
    const result = await ankiService("updateCard", { cardId, rating });

    // Revalidate any cached data that might depend on this card
    revalidatePath("/review");

    return { card: result };
  } catch (error) {
    return { error: `Error updating card: ${error}` };
  }
}

// Server action to get deck statistics
export async function getDeckStats(
  deckName: string
): Promise<{ stats: AnkiDeckStats } | AnkiError> {
  try {
    const result = await ankiService("getDeckStats", { deckName });
    return { stats: result };
  } catch (error) {
    return { error: `Error fetching deck stats: ${error}` };
  }
}
