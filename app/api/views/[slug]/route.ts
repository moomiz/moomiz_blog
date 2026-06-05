import { NextRequest, NextResponse } from "next/server";
import { getViewCount, incrementViewCount } from "@/lib/views";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const views = await getViewCount(slug);
  return NextResponse.json({ views });
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const views = await incrementViewCount(slug);
  return NextResponse.json({ views });
}
