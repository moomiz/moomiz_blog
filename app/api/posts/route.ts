import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createPost } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { PostInput } from "@/lib/types/post";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    await requireUser();
    const body = (await request.json()) as PostInput;
    const post = await createPost(body);
    return NextResponse.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
