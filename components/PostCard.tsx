import Link from "next/link";
import { Eye, Clock } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="h-2 bg-gradient-to-r from-primary/70 to-primary/20" />
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{post.category}</Badge>
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
          <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {post.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
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
      </Card>
    </Link>
  );
}
