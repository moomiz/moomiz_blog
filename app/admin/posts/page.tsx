import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { getAllPostsAdmin } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Badge, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Supabase 환경 변수를 설정해 주세요.
          </p>
          <Link href="/admin/login" className="mt-4 inline-block text-primary">
            설정 안내 보기
          </Link>
        </Card>
      </main>
    );
  }

  const posts = await getAllPostsAdmin();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">글 관리</h1>
          <p className="mt-2 text-muted-foreground">
            DB에 저장된 초안·발행 글을 관리합니다.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="h-4 w-4" />
            새 글
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card
            key={post.id ?? post.slug}
            className="flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{post.title}</h2>
                <Badge variant={post.status === "published" ? "default" : "secondary"}>
                  {post.status === "published" ? "발행" : "초안"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                /posts/{post.slug} · {formatDate(post.date)}
              </p>
            </div>
            {post.id && (
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                    편집
                  </Button>
                </Link>
                <DeletePostButton id={post.id} title={post.title} />
              </div>
            )}
          </Card>
        ))}

        {posts.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            아직 글이 없습니다.{" "}
            <code className="rounded bg-muted px-1">npm run db:seed</code>로 MDX를
            가져오거나 새 글을 작성하세요.
          </Card>
        )}
      </div>
    </main>
  );
}
