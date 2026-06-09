import Link from "next/link";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorBanner = {
  type: "success" | "error" | "info";
  message: string;
  href?: string;
  linkLabel?: string;
};

type EditorStatusBannerProps = {
  banner: EditorBanner | null;
  onDismiss?: () => void;
};

export function EditorStatusBanner({ banner, onDismiss }: EditorStatusBannerProps) {
  if (!banner) return null;

  const Icon =
    banner.type === "success"
      ? CheckCircle2
      : banner.type === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-sm",
        banner.type === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
        banner.type === "error" &&
          "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
        banner.type === "info" &&
          "border-border bg-muted/60 text-foreground"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{banner.message}</span>
        {banner.href && (
          <Link
            href={banner.href}
            className="font-medium underline underline-offset-4"
            target={banner.href.startsWith("http") ? "_blank" : undefined}
          >
            {banner.linkLabel ?? "바로가기"}
          </Link>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          닫기
        </button>
      )}
    </div>
  );
}
