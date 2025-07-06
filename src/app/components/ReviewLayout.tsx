"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCallback, useEffect, useRef, useState } from "react";
import { CardType } from "../hooks/useCard";
import { useFormFactor } from "../hooks/useFormFactor";
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
  const isCompact = useFormFactor() === "COMPACT";

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <ResizablePanelGroup
        direction={isCompact ? "vertical" : "horizontal"}
        className="w-full max-w-5xl rounded-xl shadow-xl bg-card overflow-hidden h-auto min-h-[400px] md:h-[70vh]"
      >
        <ResizablePanel
          defaultSize={50}
          minSize={20}
          maxSize={80}
          className="flex flex-col min-w-0 w-full"
        >
          <div
            ref={cardContainerRef}
            onClick={() => setFocusedPanel("card")}
            tabIndex={0}
            onFocus={() => setFocusedPanel("card")}
            className={`flex flex-col h-full w-full outline-none transition-all duration-200 relative ${
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
        </ResizablePanel>
        {/* Hide handle on compact/mobile */}
        {!isCompact && (
          <div className="hidden md:block">
            <ResizableHandle />
          </div>
        )}
        <ResizablePanel
          defaultSize={50}
          minSize={20}
          maxSize={80}
          className="flex flex-col min-w-0 w-full"
        >
          <div
            ref={chatContainerRef}
            onClick={() => setFocusedPanel("chat")}
            tabIndex={0}
            onFocus={() => setFocusedPanel("chat")}
            className={`flex flex-col h-full w-full outline-none transition-all duration-200 relative ${
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
