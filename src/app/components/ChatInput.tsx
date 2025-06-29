import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isStreaming,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount and restore focus when streaming ends
  useEffect(() => {
    if (textareaRef.current && !isStreaming) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isStreaming && !disabled) {
          onSend(value);
        }
      }
    },
    [value, isStreaming, disabled, onSend]
  );

  const handleSend = useCallback(() => {
    if (value.trim() && !isStreaming && !disabled) {
      onSend(value);
    }
  }, [value, isStreaming, disabled, onSend]);

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isStreaming ? "AnkiLM is responding..." : "Type your message..."
        }
        disabled={disabled}
        className="mb-4"
      />
      <Button
        disabled={isStreaming || !value.trim() || disabled}
        onClick={handleSend}
      >
        {isStreaming ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}
