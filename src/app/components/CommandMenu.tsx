import { Command } from "@/app/data/commands";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface CommandMenuProps {
  commands: Command[];
  onSelect: (command: Command) => void;
  visible: boolean;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export default function CommandMenu({
  commands,
  onSelect,
  visible,
  selectedIndex,
  onIndexChange,
}: CommandMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Scroll to keep selected item visible
  useEffect(() => {
    if (selectedItemRef.current && containerRef.current) {
      const selectedItem = selectedItemRef.current;

      // Use scrollIntoView for more reliable scrolling
      selectedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  if (!visible || commands.length === 0) return null;

  return (
    <Card className="absolute bottom-full mb-2 w-full max-h-48 overflow-y-auto border shadow-lg py-0">
      <CardContent className="p-0" ref={containerRef}>
        {commands.map((command, index) => (
          <button
            key={command.id}
            ref={index === selectedIndex ? selectedItemRef : null}
            onClick={() => onSelect(command)}
            onMouseEnter={() => onIndexChange(index)}
            className={`w-full text-left p-3 transition-colors border-b last:border-b-0 ${
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50 hover:text-accent-foreground"
            } ${!command.implemented ? "opacity-50" : ""}`}
            disabled={!command.implemented}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium">
                /{command.name}
                <span className="text-xs text-muted-foreground">
                  {command.implemented ? " - " : " (coming soon) - "}
                  {command.description}
                </span>
              </span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
