// This is a Server Component (no "use client")
import { getDeckNames } from "@/lib/anki-service";

export default async function DecksList() {
  try {
    const decks = await getDeckNames();
    const data = { decks };

    return (
      <div className="space-y-4">
        {data.decks.length === 0 ? (
          <p className="text-gray-500">No decks found</p>
        ) : (
          <ul className="space-y-2">
            {data.decks.map((deck: string) => (
              <li key={deck} className="p-4 border rounded hover:bg-gray-50">
                {deck}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded">
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}
