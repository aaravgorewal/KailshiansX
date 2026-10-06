import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="bg-background flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-xs font-medium">Loading content…</p>
      </div>
    </div>
  );
}
