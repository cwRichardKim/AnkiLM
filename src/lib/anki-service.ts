// Core AnkiConnect service - single source of truth for all localhost:8765 communication

type AnkiConnectRequestParams =
  | {
      deckName: string;
    }
  | {
      cardId: string;
      rating: number;
    };

// Core function to communicate with AnkiConnect - ALL localhost:8765 calls go through this
export async function ankiConnectRequest(
  action: string,
  params?: AnkiConnectRequestParams
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
