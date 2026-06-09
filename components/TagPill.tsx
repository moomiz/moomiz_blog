import { cn } from "@/lib/utils";
import { getTagPalette } from "@/lib/ui/tag-colors";

export function TagPill({
  tag,
  className,
}: {
  tag: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        getTagPalette(tag),
        className
      )}
    >
      {tag}
    </span>
  );
}
