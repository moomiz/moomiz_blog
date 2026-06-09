import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getAdminCategories, getPostByIdAdmin } from "@/lib/posts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getPostByIdAdmin(id),
    getAdminCategories(),
  ]);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-background">
      <PostEditor post={post} categories={categories} />
    </main>
  );
}
