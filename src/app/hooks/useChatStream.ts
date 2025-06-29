import { useCallback, useState } from "react";
import { ChatRequest } from "../api/chat/route";
import { MessageType } from "../components/Message";
import { Card } from "./useCard";

interface UseChatStreamProps {
  card: Card;
  backHidden: boolean;
}

interface UseChatStreamReturn {
  pastMessages: MessageType[];
  optimisticMessages: MessageType[];
  streamingMessage: MessageType | null;
  isStreaming: boolean;
  error: string | null;
  isRetrying: boolean;
  sendMessage: (message: string) => Promise<void>;
  retryMessage: () => void;
}

export function useChatStream({
  card,
  backHidden,
}: UseChatStreamProps): UseChatStreamReturn {
  const [pastMessages, setPastMessages] = useState<MessageType[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageType[]>(
    []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<MessageType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsStreaming(true);
      setError(null);

      const newMessage: MessageType = {
        role: "user",
        content: message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const newOptimisticMessages = [...optimisticMessages, newMessage];
      const allMessages = [...pastMessages, ...newOptimisticMessages];

      setOptimisticMessages(newOptimisticMessages);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: allMessages,
            context: { card, backHidden },
            command: "explain",
          } as ChatRequest),
        });

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";
        let confirmedCursor: string | null = null;

        const newStreamingMessage: MessageType = {
          role: "agent",
          content: "",
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            if (event.startsWith("data: ")) {
              try {
                const json = JSON.parse(event.slice(6));

                switch (json.type) {
                  case "metadata":
                    newStreamingMessage.timestamp = json.startedAt;
                    confirmedCursor = json.cursor;
                    break;
                  case "content":
                    newStreamingMessage.content += json.content;
                    break;
                  case "done":
                    break;
                  case "error":
                    console.error("Stream error:", json.error);
                    break;
                }
                setStreamingMessage({ ...newStreamingMessage });
              } catch (parseError) {
                console.error("Failed to parse SSE event:", event, parseError);
              }
            }
          }
        }

        setPastMessages([...allMessages, newStreamingMessage]);
        setStreamingMessage(null);
        setOptimisticMessages((prev) => {
          const indexAtCursor = prev.findIndex(
            (message) => message.id === confirmedCursor
          );
          if (indexAtCursor === -1) {
            throw new Error(
              `Cursor not found in optimistic messages: ${confirmedCursor}, ${JSON.stringify(prev)}`
            );
          }
          return prev.slice(0, indexAtCursor);
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to send message");
        setOptimisticMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
      }
    },
    [optimisticMessages, pastMessages, card, backHidden]
  );

  const retryMessage = useCallback(() => {
    if (error && optimisticMessages.length > 0) {
      const lastMessage = optimisticMessages[optimisticMessages.length - 1];
      setIsRetrying(true);
      sendMessage(lastMessage.content).finally(() => setIsRetrying(false));
    }
  }, [error, optimisticMessages, sendMessage]);

  return {
    pastMessages,
    optimisticMessages,
    streamingMessage,
    isStreaming,
    error,
    isRetrying,
    sendMessage,
    retryMessage,
  };
}
