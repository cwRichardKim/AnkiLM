import { Button } from "@/components/ui/button";

interface ChatErrorProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export default function ChatError({
  error,
  onRetry,
  isRetrying,
}: ChatErrorProps) {
  return (
    <div className="text-red-500 flex items-center gap-2">
      <span>{error}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Retrying..." : "Retry"}
      </Button>
    </div>
  );
}
