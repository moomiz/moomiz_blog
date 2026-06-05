import Link from "next/link";
import { ArrowRight, Clock, Eye } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

export function HeroPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative min-h-[280px] bg-gradient-to-br from-primary/30 via-primary/15 to-background p-10 sm:min-h-[340px] lg:min-h-[420px] lg:p-14">
            <Badge className="mb-5 text-sm">Featured · {post.category}</Badge>
            <h2 className="text-3xl font-bold leading-tight transition-colors group-hover:text-primary sm:text-4xl lg:text-5xl">
              {post.title}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {post.description}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-base font-medium text-primary">
              글 읽기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-border p-10 lg:border-l lg:border-t-0 lg:p-12">
            <p className="text-sm text-muted-foreground">최신 Tech-Log</p>
            <p className="mt-2 text-xl font-medium lg:text-2xl">{formatDate(post.date)}</p>
            <div className="mt-8 space-y-4 text-base text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readingTime}
              </p>
              <p className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {(post.views ?? 0).toLocaleString()} views
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
