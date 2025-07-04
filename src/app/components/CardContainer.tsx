import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardType } from "../hooks/useCard";

export default function CardContainer({
  card,
  reviewCard,
  backHidden,
  revealBack,
}: {
  card: CardType;
  reviewCard: (card: CardType, rating: number) => void;
  backHidden: boolean;
  revealBack: () => void;
}) {
  return (
    <div className="w-1/2 min-w-64 bg-gray-200 h-full">
      <div className="flex flex-col gap-4 m-4">
        <Card className={`p-4 gap-4 ${backHidden ? "" : "bg-gray-100"}`}>
          {card.front}
          {!backHidden && (
            <>
              <div className="w-full h-px bg-gray-300" />
              {card.back}
            </>
          )}
        </Card>
        <div className="flex flex-row gap-2 justify-center">
          {!backHidden
            ? [
                <Button
                  key="again"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => reviewCard(card, 1)}
                >
                  Again (1)
                </Button>,
                <Button
                  key="hard"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => reviewCard(card, 2)}
                >
                  Hard (2)
                </Button>,
                <Button
                  key="good"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => reviewCard(card, 3)}
                >
                  Good (3 / Space)
                </Button>,
                <Button
                  key="easy"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => reviewCard(card, 4)}
                >
                  Easy (4)
                </Button>,
              ]
            : [
                <Button key="flip" onClick={() => revealBack()}>
                  Flip (space)
                </Button>,
              ]}
        </div>
      </div>
    </div>
  );
}
