import { useEffect, useState } from "react";
import { cards } from "../data/cards";

export interface Card {
  id: string;
  front: string;
  back: string;
}

export default function useCard(
  deckId: string
): [Card | null, (card: Card, rating: number) => void] {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    // Reset to first card when deckId changes
    setCurrentCardIndex(0);
  }, [deckId]);

  const reviewCard = (card: Card, rating: number) => {
    console.log(`Reviewed card ${card.id} with rating ${rating}`);

    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // End of deck - could reset or show completion message
      console.log("End of deck reached");
      setCurrentCardIndex(0); // Reset to beginning for now
    }
  };

  const currentCard = cards[currentCardIndex] || null;

  return [currentCard, reviewCard];
}
