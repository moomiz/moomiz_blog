import { cn } from "@/lib/utils";

export function CountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground",
        className
      )}
    >
      {count}
    </span>
  );
}
