import { useEffect, useState } from "react";
import { CardType } from "../hooks/useCard";
import { useChatStream } from "../hooks/useChatStream";
import ChatError from "./ChatError";
import ChatInput from "./ChatInput";
import Thread from "./Thread";

export default function ChatContainer({
  card,
  backHidden,
  chatInputRef,
}: {
  card: CardType;
  reviewCard: (card: CardType, rating: number) => void; // TODO
  backHidden: boolean;
  chatInputRef?: React.RefObject<HTMLTextAreaElement | null>;
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
    <div className="w-full h-full p-4">
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
        textareaRef={chatInputRef}
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
