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
  const [demoCards] = useState(cards.sort(() => Math.random() - 0.5));
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [backHidden, setBackHidden] = useState(true);

  useEffect(() => {
    // Reset to first card when deckId changes
    setCurrentCardIndex(0);
  }, [deckId]);

  const reviewCard = (card: CardType, rating: number) => {
    console.log(`Reviewed card ${card.id} with rating ${rating}`);
    setBackHidden(true);
    if (currentCardIndex < demoCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // End of deck - reset to beginning
      console.log("End of deck reached");
      setCurrentCardIndex(0);
    }
  };

  const currentCard = demoCards[currentCardIndex] || null;

  return {
    currentCard,
    reviewCard,
    backHidden,
    setBackHidden,
  };
}
