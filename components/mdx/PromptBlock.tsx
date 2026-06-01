import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function PromptBlock({
  children,
  title = "내가 던진 프롬프트",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-xl border border-blue-200/60 bg-prompt",
        "dark:border-blue-900/50"
      )}
    >
      <div className="flex items-center gap-2 border-b border-blue-200/50 px-4 py-2.5 text-sm font-medium text-prompt-foreground dark:border-blue-900/40">
        <MessageSquare className="h-4 w-4" />
        <span>{title} 💬</span>
      </div>
      <div className="px-4 py-4 text-[0.98rem] leading-relaxed text-prompt-foreground">
        {children}
      </div>
    </div>
  );
}
