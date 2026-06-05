"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input } from "@/components/ui";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/posts";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabaseConfigured =
    typeof window !== "undefined" &&
    Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  if (!supabaseConfigured) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4">
        <Card className="p-8">
          <h1 className="text-2xl font-bold">Supabase 설정 필요</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            풀스택 블로그 모드는 Supabase(Postgres)가 필요합니다.{" "}
            <code className="rounded bg-muted px-1">.env.local</code>에 URL과
            Anon Key를 추가한 뒤,{" "}
            <code className="rounded bg-muted px-1">supabase/schema.sql</code>을
            실행하고 <code className="rounded bg-muted px-1">npm run db:seed</code>
            로 기존 MDX를 이전하세요.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-primary hover:underline"
          >
            ← 홈으로
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <Card className="p-8">
        <h1 className="text-2xl font-bold">관리자 로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Supabase Auth 계정으로 로그인합니다.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">이메일</label>
            <Input
              type="email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">비밀번호</label>
            <Input
              type="password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
