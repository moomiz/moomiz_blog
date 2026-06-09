import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { PostMetaRow } from "@/components/PostMetaRow";
import { TagPill } from "@/components/TagPill";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

export function PostListCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="card-craft overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary">{post.category}</Badge>
              {post.tags.slice(0, 3).map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
            <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm font-normal text-muted-foreground sm:text-base">
              {post.description}
            </p>
            <PostMetaRow
              className="mt-4"
              date={formatDate(post.date)}
              readingTime={post.readingTime}
              views={post.views ?? 0}
            />
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary sm:flex-col sm:items-end">
            읽기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
