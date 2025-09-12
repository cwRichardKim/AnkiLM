// TODO: add a list of decks once we support multiple decks

import { Suspense } from "react";
import DecksList from "./DecksList";

function DecksSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function DecksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Anki Decks</h1>
      <Suspense fallback={<DecksSkeleton />}>
        <DecksList />
      </Suspense>
    </div>
  );
}
