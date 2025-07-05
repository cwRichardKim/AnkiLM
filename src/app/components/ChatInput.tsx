import { Command, findCommand, getMatchingCommands } from "@/app/data/commands";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useRef, useState } from "react";
import CommandMenu from "./CommandMenu";
import CommandTip from "./CommandTip";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isStreaming,
  disabled = false,
  textareaRef: externalTextareaRef,
}: ChatInputProps) {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [matchingCommands, setMatchingCommands] = useState<Command[]>([]);
  const [selectedCommandMenuIndex, setSelectedCommandMenuIndex] = useState(0);

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

  // Reset selected index when commands change
  useEffect(() => {
    setSelectedCommandMenuIndex(0);
  }, [matchingCommands]);

  // Handle command detection and menu
  useEffect(() => {
    if (value.startsWith("/")) {
      const commands = getMatchingCommands(value);
      setMatchingCommands(commands);
      setShowCommandMenu(commands.length > 0);

      // Check if we have a complete command
      const command = findCommand(value);
      setSelectedCommand(command);
    } else {
      setShowCommandMenu(false);
      setSelectedCommand(null);
    }
  }, [value]);

  const handleCommandSelect = useCallback(
    (command: Command) => {
      const currentText = value;
      const afterSlash = currentText.slice(1).trim();
      const afterCommand = afterSlash.slice(command.name.length).trim();

      // Insert the command and preserve any text after it
      const newValue = `/${command.name}${afterCommand ? ` ${afterCommand}` : ""}`;
      onChange(newValue);

      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Position cursor at the end
        const length = newValue.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showCommandMenu && matchingCommands.length > 0) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedCommandMenuIndex((prev) =>
              prev < matchingCommands.length - 1 ? prev + 1 : 0
            );
            return;

          case "ArrowUp":
            e.preventDefault();
            setSelectedCommandMenuIndex((prev) =>
              prev > 0 ? prev - 1 : matchingCommands.length - 1
            );
            return;

          case "Tab":
          case "Enter":
            e.preventDefault();
            const selectedCommand = matchingCommands[selectedCommandMenuIndex];
            if (selectedCommand) {
              handleCommandSelect(selectedCommand);
            }
            return;

          case "Escape":
            e.preventDefault();
            setShowCommandMenu(false);
            return;
        }
      }

      // Handle Enter to send (only if not navigating menu)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isStreaming && !disabled) {
          onSend(value);
        }
      }
    },
    [
      showCommandMenu,
      matchingCommands,
      selectedCommandMenuIndex,
      handleCommandSelect,
      value,
      isStreaming,
      disabled,
      onSend,
    ]
  );

  const handleSend = useCallback(() => {
    if (value.trim() && !isStreaming && !disabled) {
      onSend(value);
    }
  }, [value, isStreaming, disabled, onSend]);

  const handleDismissCommandTip = useCallback(() => {
    setSelectedCommand(null);
  }, []);

  return (
    <div className="space-y-2 relative">
      {selectedCommand && (
        <CommandTip
          command={selectedCommand}
          onDismiss={handleDismissCommandTip}
        />
      )}

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isStreaming
              ? "AnkiLM is responding..."
              : "Type your message or / for commands..."
          }
          disabled={disabled}
          className="mb-4 resize-none bg-card text-card-foreground rounded-xl border shadow-sm px-4 py-3 min-h-[80px] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring"
        />

        <CommandMenu
          commands={matchingCommands}
          onSelect={handleCommandSelect}
          visible={showCommandMenu}
          selectedIndex={selectedCommandMenuIndex}
          onIndexChange={setSelectedCommandMenuIndex}
        />
      </div>

      <Button
        disabled={isStreaming || !value.trim() || disabled}
        onClick={handleSend}
      >
        {isStreaming ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}
