import { MessageType } from "./Message";

export default function Thread({ messages }: { messages: MessageType[] }) {
  return (
    <div>
      Thread ({messages.length} messages)
      <div>
        {messages.map((message) => (
          <div key={message.id}>{JSON.stringify(message)}</div>
        ))}
      </div>
    </div>
  );
}
