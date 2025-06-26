import { useState } from "react";
import { Card } from "../hooks/useCard";

export default function CardContainer({
  card,
  reviewCard,
}: {
  card: Card;
  reviewCard: (card: Card, rating: number) => void;
}) {
  const [showBack, setShowBack] = useState(false);
  return (
    <div className="w-1/2 min-w-64 bg-gray-200 h-full">
      <div>{card.front}</div>
      <div>{showBack && card.back}</div>
      {showBack ? (
        <div>
          <button onClick={() => reviewCard(card, 1)}>Again</button>
          <button onClick={() => reviewCard(card, 2)}>Hard</button>
          <button onClick={() => reviewCard(card, 3)}>Good</button>
          <button onClick={() => reviewCard(card, 4)}>Easy</button>
        </div>
      ) : (
        <button onClick={() => setShowBack(true)}>Flip</button>
      )}
    </div>
  );
}
