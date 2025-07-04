"use client";
import { useEffect, useRef, useState } from "react";
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
  const handleKeyDown = (e: KeyboardEvent) => {
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
  };

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
  }, [focusedPanel]);

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
        className={`w-1/2 min-w-64 bg-gray-200 h-full transition-all duration-300 cursor-pointer relative outline-none ${
          focusedPanel === "card"
            ? "z-10 shadow-lg ring-2 ring-blue-400 ring-opacity-60"
            : "z-0 opacity-85 hover:opacity-95"
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
        className={`w-1/2 min-w-64 bg-gray-100 h-full transition-all duration-300 cursor-pointer relative outline-none ${
          focusedPanel === "chat"
            ? "z-10 shadow-lg ring-2 ring-blue-400 ring-opacity-60"
            : "z-0 opacity-85 hover:opacity-95"
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
