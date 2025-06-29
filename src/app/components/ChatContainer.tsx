import { useEffect, useState } from "react";
import { Card } from "../hooks/useCard";
import { useChatStream } from "../hooks/useChatStream";
import ChatError from "./ChatError";
import ChatInput from "./ChatInput";
import Thread from "./Thread";

export default function ChatContainer({
  card,
  backHidden,
}: {
  card: Card;
  reviewCard: (card: Card, rating: number) => void; // TODO
  backHidden: boolean;
}) {
  const [input, setInput] = useState("");

  const {
    pastMessages,
    optimisticMessages,
    streamingMessage,
    isStreaming,
    error,
    isRetrying,
    sendMessage,
    retryMessage,
  } = useChatStream({ card, backHidden });

  // Cleanup when card changes
  useEffect(() => {
    setInput("");
  }, [card]);

  const handleSendMessage = async (message: string) => {
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="w-1/2 min-w-64 bg-gray-100 h-full p-4">
      <div>ChatContainer</div>
      <Thread
        pastMessages={pastMessages}
        optimisticMessages={optimisticMessages}
        streamingMessage={streamingMessage}
      />
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSendMessage}
        isStreaming={isStreaming}
      />
      {error && (
        <ChatError
          error={error}
          onRetry={retryMessage}
          isRetrying={isRetrying}
        />
      )}
    </div>
  );
}
