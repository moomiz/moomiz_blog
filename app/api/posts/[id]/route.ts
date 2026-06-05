import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { deletePost, updatePost } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { PostInput } from "@/lib/types/post";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    await requireUser();
    const { id } = await context.params;
    const body = (await request.json()) as PostInput;
    const post = await updatePost(id, body);
    return NextResponse.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    await requireUser();
    const { id } = await context.params;
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
