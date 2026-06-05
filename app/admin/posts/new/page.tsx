import { PostEditor } from "@/components/admin/PostEditor";
import Link from "next/link";

export default function NewPostPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          href="/admin/posts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 글 목록
        </Link>
        <h1 className="mt-2 text-3xl font-bold">새 Tech-Log 작성</h1>
      </div>
      <PostEditor />
    </main>
  );
}
