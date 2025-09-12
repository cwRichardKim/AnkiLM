// This is a Server Component (no "use client")
async function getDecksData() {
  try {
    // Call our API route instead of AnkiConnect directly
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/decks`,
      {
        cache: "no-store", // Ensure fresh data
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch decks");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching decks: ${error}`);
  }
}

export default async function DecksList() {
  const result = await getDecksData();

  if ("error" in result) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded">
        Error: {result.error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {result.decks.length === 0 ? (
        <p className="text-gray-500">No decks found</p>
      ) : (
        <ul className="space-y-2">
          {result.decks.map((deck: string) => (
            <li key={deck} className="p-4 border rounded hover:bg-gray-50">
              {deck}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
