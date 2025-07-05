import { useEffect, useState } from "react";
import { cards } from "../data/cards";

export interface CardType {
  id: string;
  front: string;
  back: string;
}

export default function useCard(deckId: string): {
  currentCard: CardType | null;
  reviewCard: (card: CardType, rating: number) => void;
  backHidden: boolean;
  setBackHidden: (backHidden: boolean) => void;
} {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [backHidden, setBackHidden] = useState(true);

  useEffect(() => {
    // Reset to first card when deckId changes
    setCurrentCardIndex(0);
  }, [deckId]);

  const reviewCard = (card: CardType, rating: number) => {
    console.log(`Reviewed card ${card.id} with rating ${rating}`);

    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // End of deck - could reset or show completion message
      console.log("End of deck reached");
      setCurrentCardIndex(0);
    }
    setBackHidden(true);
  };

  const currentCard = cards[currentCardIndex] || null;

  return { currentCard, reviewCard, backHidden, setBackHidden };
}
