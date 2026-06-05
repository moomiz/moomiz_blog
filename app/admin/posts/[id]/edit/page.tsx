import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getPostByIdAdmin } from "@/lib/posts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostByIdAdmin(id);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          href="/admin/posts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 글 목록
        </Link>
        <h1 className="mt-2 text-3xl font-bold">글 편집</h1>
        <p className="text-sm text-muted-foreground">/{post.slug}</p>
      </div>
      <PostEditor post={post} />
    </main>
  );
}
