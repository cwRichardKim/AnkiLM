import { MessageType } from "./Message";

export default function Thread({ messages }: { messages: MessageType[] }) {
  return <div>Thread {JSON.stringify(messages)}</div>;
}
