import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { Card } from "../hooks/useCard";
import Message, { MessageType } from "./Message";
import Thread from "./Thread";

export default function ChatContainer({
  card,
  reviewCard,
}: {
  card: Card;
  reviewCard: (card: Card, rating: number) => void;
}) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage] = useState<MessageType | null>(null);
  const sendMessage = useCallback(
    async (message: string) => {
      setInput("");
      setIsStreaming(true);
      setMessages((prev) => [...prev, { role: "user", content: message }]);
      fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          command: "explain",
        }),
      }).then((res) => {
        console.log(res);
      });
      // send post request to /api/chat
      // listen for streaming response
      // set streaming response to streaming message
      console.log(message);
    },
    [messages]
  );
  console.log(card, reviewCard);
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
    </div>
  );
}
