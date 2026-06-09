import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingDisplayProps = {
  label?: string;
  className?: string;
};

export function LoadingDisplay({ label = "読み込み中", className }: LoadingDisplayProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 items-center justify-center gap-2 rounded-lg border bg-white text-sm text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
