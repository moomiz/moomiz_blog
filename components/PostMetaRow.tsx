import { Calendar, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type PostMetaRowProps = {
  date: string;
  readingTime?: string;
  views?: number;
  className?: string;
  size?: "sm" | "md";
};

export function PostMetaRow({
  date,
  readingTime,
  views,
  className,
  size = "sm",
}: PostMetaRowProps) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textClass = size === "sm" ? "text-xs sm:text-sm" : "text-sm";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground",
        textClass,
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Calendar className={iconClass} aria-hidden />
        {date}
      </span>
      {readingTime && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className={iconClass} aria-hidden />
          {readingTime}
        </span>
      )}
      {views !== undefined && (
        <span className="inline-flex items-center gap-1.5">
          <Eye className={iconClass} aria-hidden />
          {views.toLocaleString()}
        </span>
      )}
    </div>
  );
}
