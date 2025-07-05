"use client";
import { use } from "react";
import ReviewLayout from "../../components/ReviewLayout";
import useCard from "../../hooks/useCard";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const { currentCard, reviewCard, backHidden, setBackHidden } =
    useCard(deckId);

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading deck...</h2>
          <p className="text-gray-600">Deck ID: {deckId}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ReviewPage {deckId} */}
      <ReviewLayout
        card={currentCard}
        reviewCard={reviewCard}
        backHidden={backHidden}
        revealBack={() => setBackHidden(false)}
      />
    </div>
  );
}
