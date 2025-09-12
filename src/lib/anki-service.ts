// Core AnkiConnect service - single source of truth for all localhost:8765 communication

// Types
export interface AnkiCard {
  id: string;
  front: string;
  back: string;
  deckName: string;
}

export interface AnkiDeckStats {
  // TODO: Define proper structure based on AnkiConnect response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Core function to communicate with AnkiConnect - ALL localhost:8765 calls go through this
async function ankiConnectRequest(
  action: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
) {
  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
      throw new Error("AnkiConnect not available");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`AnkiConnect error: ${error}`);
  }
}

// Type-safe functions - THE ONLY interface to AnkiConnect
export async function getDeckNames(): Promise<string[]> {
  return ankiConnectRequest("deckNames");
}

export async function getNextCard(deckName: string): Promise<AnkiCard> {
  return ankiConnectRequest("getNextCard", { deckName });
}

export async function updateCard(
  cardId: string,
  rating: number
): Promise<AnkiCard> {
  return ankiConnectRequest("updateCard", { cardId, rating });
}

export async function getDeckStats(deckName: string): Promise<AnkiDeckStats> {
  return ankiConnectRequest("getDeckStats", { deckName });
}
