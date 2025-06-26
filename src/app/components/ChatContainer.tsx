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
  const [messages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [streamingMessage] = useState<MessageType | null>(null);
  const sendMessage = useCallback((message: string) => {
    // send post request to /api/chat
    // listen for streaming response
    // set streaming response to streaming message
    console.log(message);
  }, []);
  console.log(card, reviewCard);
  return (
    <div className="w-1/2 min-w-64 bg-gray-100 h-full">
      <div>ChatContainer</div>
      <Thread messages={messages} />
      <div>Streaming message</div>
      {streamingMessage && <Message message={streamingMessage} />}
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => sendMessage(input)}>send</button>
      </div>
    </div>
  );
}
