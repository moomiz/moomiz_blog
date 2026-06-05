import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { getLatestComments } from "@/lib/github/comments";
import { formatDate } from "@/lib/utils";

export async function LatestComments() {
  const comments = await getLatestComments(5);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">최신 댓글</h2>
        </div>
      </div>

      <div className="divide-y divide-border">
        {comments.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            아직 댓글이 없거나 Giscus 저장소 설정을 확인해 주세요.
          </p>
        ) : (
          comments.map((comment) => (
            <Link
              key={comment.id}
              href={comment.discussionUrl}
              target="_blank"
              rel="noreferrer"
              className="block px-5 py-4 transition-colors hover:bg-muted/40"
            >
              <p className="text-sm leading-relaxed text-foreground">
                {comment.body}
                {comment.body.length >= 120 ? "…" : ""}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  @{comment.author}
                </span>
                {" · "}
                {formatDate(comment.createdAt)}
              </p>
              <p className="mt-1 truncate text-xs text-primary/80">
                {comment.discussionTitle}
              </p>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
