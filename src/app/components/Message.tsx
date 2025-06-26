export interface MessageType {
  role: string;
  content: string;
}

export default function Message({ message }: { message: MessageType }) {
  return <div>Message {message.content}</div>;
}
