import { useMemo } from "react";
import Message, { MessageType } from "./Message";

export default function Thread({
  pastMessages,
  optimisticMessages,
  streamingMessage,
}: {
  pastMessages: MessageType[];
  optimisticMessages: MessageType[];
  streamingMessage: MessageType | null;
}) {
  const messages = useMemo(
    () =>
      [
        ...pastMessages,
        ...optimisticMessages,
        ...(streamingMessage ? [streamingMessage] : []),
      ].filter((message) => message !== null),
    [pastMessages, optimisticMessages, streamingMessage]
  );
  return (
    <div>
      Thread ({messages.length} messages)
      <div>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
