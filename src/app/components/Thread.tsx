import Message, { MessageType } from "./Message";

export default function Thread({ messages }: { messages: MessageType[] }) {
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
