import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResponseBlock({
  children,
  title = "AI의 답변",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-xl border border-border bg-response"
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-response-foreground">
        <Bot className="h-4 w-4" />
        <span>{title} 🤖</span>
      </div>
      <div className="px-4 py-4 text-[0.98rem] leading-relaxed text-response-foreground">
        {children}
      </div>
    </div>
  );
}
