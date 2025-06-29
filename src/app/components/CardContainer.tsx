import { Card } from "../hooks/useCard";

export default function CardContainer({
  card,
  reviewCard,
  backHidden,
  revealBack,
}: {
  card: Card;
  reviewCard: (card: Card, rating: number) => void;
  backHidden: boolean;
  revealBack: () => void;
}) {
  return (
    <div className="w-1/2 min-w-64 bg-gray-200 h-full">
      <div>{card.front}</div>
      {!backHidden && <div>{card.back}</div>}
      {!backHidden ? (
        <div>
          <button onClick={() => reviewCard(card, 1)}>Again</button>
          <button onClick={() => reviewCard(card, 2)}>Hard</button>
          <button onClick={() => reviewCard(card, 3)}>Good</button>
          <button onClick={() => reviewCard(card, 4)}>Easy</button>
        </div>
      ) : (
        <button onClick={() => revealBack()}>Flip</button>
      )}
    </div>
  );
}
