export interface Card {
  id: string;
  front: string;
  back: string;
}

export default function useCard(
  deckId: string
): [Card, (card: Card, rating: number) => void] {
  console.log(deckId);
  return [
    {
      id: "1",
      front: "What is the capital of France?",
      back: "Paris",
    },
    (card: Card, rating: number) => {
      console.log(card, rating);
    },
  ];
}
