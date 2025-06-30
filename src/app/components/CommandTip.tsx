import { Command } from "@/app/data/commands";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface CommandTipProps {
  command: Command;
  onDismiss: () => void;
}

export default function CommandTip({ command, onDismiss }: CommandTipProps) {
  return (
    <Card className="mb-3 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 py-0">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-1">
              <span className="font-mono text-sm font-medium text-blue-700 dark:text-blue-300">
                /{command.name}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {" - "}
                {command.longDescription}
              </span>
            </div>
            {command.example && (
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-1 font-mono">
                Example: {command.example}
              </p>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
