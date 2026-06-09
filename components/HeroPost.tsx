import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { PostMetaRow } from "@/components/PostMetaRow";
import { TagPill } from "@/components/TagPill";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

export function HeroPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="card-craft overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative min-h-[260px] bg-gradient-to-br from-muted/90 via-card to-card p-8 sm:min-h-[300px] sm:p-10 lg:min-h-[380px] lg:p-12">
            <Badge className="mb-4 bg-primary/10 text-primary">
              Featured · {post.category}
            </Badge>
            <h2 className="text-3xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl lg:text-[2.75rem]">
              {post.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base font-normal leading-relaxed text-muted-foreground lg:text-lg">
              {post.description}
            </p>
            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">
              글 읽기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-border/60 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              최신 Tech-Log
            </p>
            <PostMetaRow
              className="mt-4"
              size="md"
              date={formatDate(post.date)}
              readingTime={post.readingTime}
              views={post.views ?? 0}
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
