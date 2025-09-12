export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body; // type this

    switch (action) {
      case "getDecks":
        return await getDecks();
      case "getNextCard":
        return await getNextCard(body.deckName); // should us an id?
      case "updateCard": // too generic a name?
        return await updateCard(body.cardId, body.rating);
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: "Error: " + error }, { status: 500 });
  }
}

async function getDecks() {
  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deckNames" }),
    });
    if (!response.ok) {
      throw new Error("AnkiConnect not available");
    }

    const decks = await response.json();

    const deckNames = decks.result;
    return Response.json({ decks: deckNames });
  } catch (error) {
    return Response.json({ error: "Error: " + error }, { status: 500 });
  }
}

async function getNextCard(deckName: string) {
  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getNextCard", deckName }),
    });
    if (!response.ok) {
      throw new Error("AnkiConnect not available");
    }

    const card = await response.json();
    return Response.json({ card });
  } catch (error) {
    return Response.json({ error: "Error: " + error }, { status: 500 });
  }
}

async function updateCard(cardId: string, rating: number) {
  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateCard", cardId, rating }),
    });
    if (!response.ok) {
      throw new Error("AnkiConnect not available");
    }

    const card = await response.json();
    return Response.json({ card });
  } catch (error) {
    return Response.json({ error: "Error: " + error }, { status: 500 });
  }
}
