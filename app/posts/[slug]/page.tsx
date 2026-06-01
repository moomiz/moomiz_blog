import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { MdxContent } from "@/components/mdx/MdxContent";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";
import { ViewCounter } from "@/components/ViewCounter";
import { GiscusComments } from "@/components/GiscusComments";
import { Badge } from "@/components/ui";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { getViewCount } from "@/lib/views";
import { formatDate } from "@/lib/utils";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "글을 찾을 수 없음" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const views = getViewCount(slug);

  return (
    <>
      <ReadingProgress />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/posts"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          글 목록으로
        </Link>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_240px]">
          <article className="min-w-0">
            <header className="mb-8 border-b border-border pb-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge>{post.category}</Badge>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {post.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDate(post.date)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </span>
                <ViewCounter slug={slug} initialViews={views} />
              </div>
            </header>

            <div className="prose-blog">
              <MdxContent source={post.content} />
            </div>

            <GiscusComments slug={slug} />
          </article>

          <TableOfContents content={post.content} />
        </div>
      </main>
    </>
  );
}
