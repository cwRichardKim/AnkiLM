export interface MessageType {
  role: string;
  content: string;
  id: string;
  timestamp: number;
}

export default function Message({ message }: { message: MessageType }) {
  return (
    <div>
      <div>
        {message.role}: {message.content}
      </div>
    </div>
  );
}
