import { Card } from "@/components/ui/card";

export interface MessageType {
  role: "user" | "agent";
  content: string;
  id: string;
  timestamp: number;
}

export default function Message({ message }: { message: MessageType }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card className="p-4 max-w-9/10 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <b>{isUser ? "You" : "AnkiLM"}</b>
          <span className="text-xs text-gray-500">
            (
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            )
          </span>
        </div>
        <div>{message.content}</div>
      </Card>
    </div>
  );
}
