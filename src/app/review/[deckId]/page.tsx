"use client";
import { use } from "react";
import CardContainer from "../../components/CardContainer";
import ChatContainer from "../../components/ChatContainer";
import useCard from "../../hooks/useCard";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const [card, reviewCard] = useCard(deckId);
  return (
    <div>
      ReviewPage {deckId}
      <div className="flex flex-row w-full h-screen">
        <CardContainer card={card} reviewCard={reviewCard} />
        <ChatContainer card={card} reviewCard={reviewCard} />
      </div>
    </div>
  );
}
