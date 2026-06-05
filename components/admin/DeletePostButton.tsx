"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type DeletePostButtonProps = {
  id: string;
  title: string;
  size?: "default" | "sm";
  className?: string;
};

export function DeletePostButton({
  id,
  title,
  size = "sm",
  className,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    const confirmed = confirm(
      `"${title}" 글을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "삭제 실패");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onDelete}
      disabled={loading}
      className={cn(
        "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/40",
        className
      )}
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "삭제 중..." : "삭제"}
    </Button>
  );
}
