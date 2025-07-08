import { useCallback, useState } from "react";
import { ChatRequest } from "../api/chat/route";
import { MessageType } from "../components/Message";
import { CardType } from "./useCard";

interface UseChatStreamProps {
  card: CardType;
  backHidden: boolean;
}

interface UseChatStreamReturn {
  abortCurrentStream: () => void;
  error: string | null;
  isRetrying: boolean;
  isStreaming: boolean;
  optimisticMessages: MessageType[];
  pastMessages: MessageType[];
  retryMessage: () => void;
  sendMessage: (message: string) => Promise<void>;
  streamingMessage: MessageType | null;
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
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const abortCurrentStream = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  const sendMessage = useCallback(
    async (message: string, command: ChatRequest["command"] = "explain") => {
      if (!message.trim()) return;
      abortCurrentStream();

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

      const newStreamingMessage: MessageType = {
        role: "agent",
        content: "",
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      try {
        const controller = new AbortController();
        setAbortController(controller);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: allMessages,
            context: { card, backHidden },
            command,
          } as ChatRequest),
          signal: controller.signal,
        });

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

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
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            console.error(err);
            setError(err.message);
          }
        }
      } finally {
        // When the stream is complete or aborted or encounters an error, we set everything
        // to be part of the thread and reset optimistic messages and the streaming message.
        // TODO: use optimistic for retrying
        setOptimisticMessages([]);
        setStreamingMessage(null);

        // any in progress streaming message is now part of the thread
        setPastMessages([
          ...allMessages,
          ...(newStreamingMessage ? [newStreamingMessage] : []),
        ]);
        setIsStreaming(false);
        setAbortController(null);
      }
    },
    [abortCurrentStream, optimisticMessages, pastMessages, card, backHidden]
  );

  const retryMessage = useCallback(() => {
    if (error && optimisticMessages.length > 0) {
      const lastMessage = optimisticMessages[optimisticMessages.length - 1];
      setIsRetrying(true);
      sendMessage(lastMessage.content).finally(() => setIsRetrying(false));
    }
  }, [error, optimisticMessages, sendMessage]);

  return {
    abortCurrentStream,
    error,
    isRetrying,
    isStreaming,
    optimisticMessages,
    pastMessages,
    retryMessage,
    sendMessage,
    streamingMessage,
  };
}
