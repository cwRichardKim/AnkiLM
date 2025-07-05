"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CardType } from "../hooks/useCard";
import CardContainer from "./CardContainer";
import ChatContainer from "./ChatContainer";

type FocusedPanel = "card" | "chat";

interface ReviewLayoutProps {
  card: CardType;
  reviewCard: (card: CardType, rating: number) => void;
  backHidden: boolean;
  revealBack: () => void;
}

export default function ReviewLayout({
  card,
  reviewCard,
  backHidden,
  revealBack,
}: ReviewLayoutProps) {
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>("card");
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Handle Tab key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const newPanel = focusedPanel === "card" ? "chat" : "card";
        setFocusedPanel(newPanel);

        // Focus the appropriate container
        if (newPanel === "card" && cardContainerRef.current) {
          cardContainerRef.current.focus();
        } else if (newPanel === "chat" && chatContainerRef.current) {
          chatContainerRef.current.focus();
        }
      }
    },
    [focusedPanel, cardContainerRef, chatContainerRef]
  );

  // Focus chat input when chat panel is focused
  useEffect(() => {
    if (focusedPanel === "chat" && chatInputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 0);
    }
  }, [focusedPanel]);

  // Add global keyboard listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedPanel, handleKeyDown]);

  const handleCardClick = () => {
    setFocusedPanel("card");
  };

  const handleChatClick = () => {
    setFocusedPanel("chat");
  };

  return (
    <div className="flex flex-row w-full h-screen relative">
      {/* Card Container */}
      <div
        ref={cardContainerRef}
        onClick={handleCardClick}
        tabIndex={0}
        onFocus={() => setFocusedPanel("card")}
        className={`w-1/2 min-w-64  h-full transition-all duration-300 relative outline-none ${
          focusedPanel === "card"
            ? "z-10 shadow-lg bg-gray-100"
            : "z-0 bg-gray-200"
        }`}
      >
        <CardContainer
          card={card}
          reviewCard={reviewCard}
          backHidden={backHidden}
          revealBack={revealBack}
          isFocused={focusedPanel === "card"}
        />
      </div>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        onClick={handleChatClick}
        tabIndex={0}
        onFocus={() => setFocusedPanel("chat")}
        className={`w-1/2 min-w-64 h-full transition-all duration-300 relative outline-none ${
          focusedPanel === "chat"
            ? "z-10 shadow-lg bg-gray-100"
            : "z-0 bg-gray-200"
        }`}
      >
        <ChatContainer
          card={card}
          reviewCard={reviewCard}
          backHidden={backHidden}
          chatInputRef={chatInputRef}
        />
      </div>
    </div>
  );
}
