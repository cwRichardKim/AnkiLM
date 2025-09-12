"use server";

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

// Helper function to communicate with AnkiConnect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ankiConnectRequest(action: string, params: any = {}) {
  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
      throw new Error("AnkiConnect not available");
    }

    return await response.json();
  } catch (error) {
    throw new Error(`AnkiConnect error: ${error}`);
  }
}

// Server action to get all decks
export async function getDecks(): Promise<{ decks: string[] } | AnkiError> {
  try {
    const result = await ankiConnectRequest("deckNames");
    return { decks: result.result };
  } catch (error) {
    return { error: `Error fetching decks: ${error}` };
  }
}

// Server action to get the next card from a deck
export async function getNextCard(
  deckName: string
): Promise<{ card: AnkiCard } | AnkiError> {
  try {
    const result = await ankiConnectRequest("getNextCard", { deckName });
    return { card: result.result };
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
    const result = await ankiConnectRequest("updateCard", { cardId, rating });

    // Revalidate any cached data that might depend on this card
    revalidatePath("/review");

    return { card: result.result };
  } catch (error) {
    return { error: `Error updating card: ${error}` };
  }
}

// Server action to get deck statistics
export async function getDeckStats(
  deckName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ stats: any } | AnkiError> {
  try {
    const result = await ankiConnectRequest("getDeckStats", { deckName });
    return { stats: result.result };
  } catch (error) {
    return { error: `Error fetching deck stats: ${error}` };
  }
}
