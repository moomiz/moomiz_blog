import Link from "next/link";
import { ArrowRight, Clock, Eye } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

export function HeroPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative min-h-[220px] bg-gradient-to-br from-primary/25 via-primary/10 to-background p-8 lg:min-h-[320px] lg:p-10">
            <Badge className="mb-4">Featured · {post.category}</Badge>
            <h2 className="text-2xl font-bold leading-tight transition-colors group-hover:text-primary sm:text-3xl lg:text-4xl">
              {post.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {post.description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
              글 읽기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-border p-8 lg:border-l lg:border-t-0">
            <p className="text-sm text-muted-foreground">최신 Tech-Log</p>
            <p className="mt-2 text-lg font-medium">{formatDate(post.date)}</p>
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readingTime}
              </p>
              <p className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {(post.views ?? 0).toLocaleString()} views
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
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
