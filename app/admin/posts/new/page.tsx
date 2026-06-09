import { PostEditor } from "@/components/admin/PostEditor";
import { getAdminCategories } from "@/lib/posts";

export default async function NewPostPage() {
  const categories = await getAdminCategories();

  return (
    <main className="min-h-screen bg-background">
      <PostEditor categories={categories} />
    </main>
  );
}
