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

  // Handle card keyboard shortcuts when card panel is focused
  const handleCardKeyDown = (e: KeyboardEvent) => {
    if (focusedPanel !== "card") return;

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
    document.addEventListener("keydown", handleCardKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleCardKeyDown);
    };
  }, [focusedPanel, backHidden, card]);

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
