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
    abortCurrentStream,
    error,
    isRetrying,
    isStreaming,
    optimisticMessages,
    pastMessages,
    retryMessage,
    sendMessage,
    streamingMessage,
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
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <Thread
          pastMessages={pastMessages}
          optimisticMessages={optimisticMessages}
          streamingMessage={streamingMessage}
        />
      </div>
      <div className="sticky bottom-0 bg-inherit z-10 p-4 border-t border-border">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          isStreaming={isStreaming}
          textareaRef={chatInputRef}
          abortCurrentStream={abortCurrentStream}
        />
        {error && (
          <ChatError
            error={error}
            onRetry={retryMessage}
            isRetrying={isRetrying}
          />
        )}
      </div>
    </div>
  );
}
