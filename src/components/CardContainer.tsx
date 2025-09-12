import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { CardType } from "../hooks/useCard";
import { useFormFactor } from "../hooks/useFormFactor";

export default function CardContainer({
  card,
  reviewCard,
  backHidden,
  revealBack,
  isFocused,
}: {
  card: CardType;
  reviewCard: (card: CardType, rating: number) => void;
  backHidden: boolean;
  revealBack: () => void;
  isFocused: boolean;
}) {
  const isCompact = useFormFactor() === "COMPACT";
  // Handle card keyboard shortcuts when focused
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if no input element is focused
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        (activeElement instanceof HTMLElement &&
          activeElement.contentEditable === "true")
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (backHidden) {
            revealBack();
          } else {
            reviewCard(card, 3); // Good
          }
          break;
        case "1":
          e.preventDefault();
          if (!backHidden) {
            reviewCard(card, 1); // Again
          }
          break;
        case "2":
          e.preventDefault();
          if (!backHidden) {
            reviewCard(card, 2); // Hard
          }
          break;
        case "3":
          e.preventDefault();
          if (!backHidden) {
            reviewCard(card, 3); // Good
          }
          break;
        case "4":
          e.preventDefault();
          if (!backHidden) {
            reviewCard(card, 4); // Easy
          }
          break;
        case "Enter":
          e.preventDefault();
          if (backHidden) {
            revealBack();
          } else {
            reviewCard(card, 3); // Good
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, backHidden, card, reviewCard, revealBack]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <Card key={card.id} className={`p-4 gap-0`}>
          <div className="text-foreground space-y-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {card.front}
            </ReactMarkdown>
          </div>
          <div
            className={`grid transition-all duration-200 ease-in-out ${
              backHidden
                ? "grid-rows-[0fr] opacity-0"
                : "grid-rows-[1fr] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
              <div className="w-full h-px bg-gray-300 my-4" />
              <div className="text-foreground space-y-3">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {card.back}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="sticky bottom-0 bg-inherit z-10 flex justify-center p-4 border-t border-border">
        <div className="flex flex-row flex-wrap gap-2 relative justify-center">
          {isFocused && (
            <div className="absolute inset-0 ring-2 ring-blue-200 rounded-lg pointer-events-none" />
          )}
          {!backHidden
            ? [
                <Button
                  key="again"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => reviewCard(card, 1)}
                >
                  {isCompact ? "Again" : "Again (1)"}
                </Button>,
                <Button
                  key="hard"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => reviewCard(card, 2)}
                >
                  {isCompact ? "Hard" : "Hard (2)"}
                </Button>,
                <Button
                  key="good"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => reviewCard(card, 3)}
                >
                  {isCompact ? "Good" : "Good (3 / Space)"}
                </Button>,
                <Button
                  key="easy"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => reviewCard(card, 4)}
                >
                  {isCompact ? "Easy" : "Easy (4)"}
                </Button>,
              ]
            : [
                <Button key="flip" onClick={() => revealBack()}>
                  {isCompact ? "Flip" : "Flip (space)"}
                </Button>,
              ]}
        </div>
      </div>
    </div>
  );
}
