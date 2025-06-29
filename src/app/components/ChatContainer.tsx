import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { ChatRequest } from "../api/chat/route";
import { Card } from "../hooks/useCard";
import { MessageType } from "./Message";
import Thread from "./Thread";

export default function ChatContainer({
  card,
}: {
  card: Card;
  reviewCard: (card: Card, rating: number) => void; // TODO
}) {
  const [pastMessages, setPastMessages] = useState<MessageType[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageType[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<MessageType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Cleanup streaming state when card changes
  useEffect(() => {
    setStreamingMessage(null);
    setOptimisticMessages([]);
    setError(null);
  }, [card]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return; // Don't send empty messages

      setInput("");
      setIsStreaming(true);
      setError(null); // Clear previous errors

      // the message being sent
      const newMessage: MessageType = {
        role: "user",
        content: message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      // queued messages that have not been confirmed by server yet
      const newOptimisticMessages = [...optimisticMessages, newMessage];
      // all messages in the UI
      const allMessages = [...pastMessages, ...newOptimisticMessages];

      setOptimisticMessages(newOptimisticMessages);
      fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: allMessages,
          context: { card },
          command: "explain",
        } as ChatRequest),
      })
        .then(async (res) => {
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

            // Split on event delimiter (double newline)
            const events = buffer.split("\n\n");
            buffer = events.pop() || ""; // Keep incomplete event in buffer

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
                  console.error(
                    "Failed to parse SSE event:",
                    event,
                    parseError
                  );
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
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "Failed to send message");
          // Remove the optimistic message on error
          setOptimisticMessages((prev) => prev.slice(0, -1));
        })
        .finally(() => {
          setIsStreaming(false);
        });
    },
    [optimisticMessages, pastMessages, card]
  );

  const retryMessage = useCallback(() => {
    if (error && optimisticMessages.length > 0) {
      const lastMessage = optimisticMessages[optimisticMessages.length - 1];
      setIsRetrying(true);
      sendMessage(lastMessage.content).finally(() => setIsRetrying(false));
    }
  }, [error, optimisticMessages, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isStreaming) {
          sendMessage(input);
        }
      }
    },
    [input, isStreaming, sendMessage]
  );

  return (
    <div className="w-1/2 min-w-64 bg-gray-100 h-full p-4">
      <div>ChatContainer</div>
      <Thread
        pastMessages={pastMessages}
        optimisticMessages={optimisticMessages}
        streamingMessage={streamingMessage}
      />
      <div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isStreaming}
        />
        <Button
          disabled={isStreaming || !input.trim()}
          onClick={() => sendMessage(input)}
        >
          {isStreaming ? "Sending..." : "Send"}
        </Button>
      </div>
      {error && (
        <div className="text-red-500 flex items-center gap-2">
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={retryMessage}
            disabled={isRetrying}
          >
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
        </div>
      )}
    </div>
  );
}
