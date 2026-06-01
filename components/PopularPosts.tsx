import { PostCard } from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";

export function PopularPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-lg font-semibold">인기 글 (Most Read)</h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
