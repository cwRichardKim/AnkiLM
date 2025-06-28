import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useMemo, useState } from "react";
import { ChatRequest, ChatResponse } from "../api/chat/route";
import { Card } from "../hooks/useCard";
import Message, { MessageType } from "./Message";
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

  const sendMessage = useCallback(
    async (message: string) => {
      setInput("");
      setIsStreaming(true);

      // the message being sent
      const newMessage = {
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

      // setPastMessages((prev) => [...prev, { role: "user", content: message }]);
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
          const { response, id, timestamp } =
            (await res.json()) as ChatResponse;
          // TODO: check the cursor and move optimistic messages at or before the cursor to pastMessages
          setPastMessages(allMessages);
          setStreamingMessage({
            role: "agent",
            content: response,
            id,
            timestamp,
          });
          setOptimisticMessages([]);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
        })
        .finally(() => {
          setIsStreaming(false);
        });
    },
    [optimisticMessages, pastMessages, card]
  );

  const messages = useMemo(
    () => [
      ...pastMessages,
      ...optimisticMessages,
      ...(streamingMessage ? [streamingMessage] : []),
    ],
    [pastMessages, optimisticMessages, streamingMessage]
  );

  return (
    <div className="w-1/2 min-w-64 bg-gray-100 h-full">
      <div>ChatContainer</div>
      <Thread messages={messages} />
      <div>Streaming message</div>
      {streamingMessage && <Message message={streamingMessage} />}
      <div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} />
        <Button disabled={isStreaming} onClick={() => sendMessage(input)}>
          send
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
