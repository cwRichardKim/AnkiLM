import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useMemo, useState } from "react";
import { ChatRequest } from "../api/chat/route";
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
          const reader = res.body?.getReader();
          if (!reader) throw new Error("No reader");
          const decoder = new TextDecoder();
          let content = "";
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Split on event delimiter (double newline)
            // This is safe because the delimiter is outside the JSON content
            const events = buffer.split("\n\n");
            buffer = events.pop() || ""; // Keep incomplete event in buffer

            for (const event of events) {
              if (event.startsWith("data: ")) {
                try {
                  const json = JSON.parse(event.slice(6));
                  console.log("Parsed event:", json);

                  switch (json.type) {
                    case "metadata":
                      console.log(
                        "Stream started at:",
                        json.startedAt,
                        "cursor:",
                        json.cursor
                      );
                      break;
                    case "content":
                      content += json.content;
                      console.log("Content updated:", content);
                      break;
                    case "done":
                      console.log("Stream completed");
                      break;
                    case "error":
                      console.error("Stream error:", json.error);
                      break;
                  }
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

          setPastMessages(allMessages);
          // setStreamingMessage({
          //   role: "agent",
          //   content: response,
          //   id,
          //   timestamp,
          // });
          // setOptimisticMessages((prev) => {
          //   const indexAtCursor = prev.findIndex(
          //     (message) => message.id === cursor
          //   );
          //   if (indexAtCursor === -1) {
          //     throw new Error(
          //       `Cursor not found in optimistic messages: ${cursor}, ${JSON.stringify(prev)}`
          //     );
          //   }
          //   return prev.slice(0, indexAtCursor);
          // });
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

  const clearServerSessions = useCallback(() => {
    fetch("/api/chat/stream?sessionId=*", {
      method: "DELETE",
    });
  }, []);

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
        <Button onClick={clearServerSessions}>Clear server sessions</Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
