import Link from "next/link";
import { Eye, Clock, ArrowRight } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

export function PostListCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{post.category}</Badge>
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary sm:text-xl">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground sm:text-base">
              {post.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:text-sm">
              <span>{formatDate(post.date)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {(post.views ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary sm:flex-col sm:items-end">
            읽기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
