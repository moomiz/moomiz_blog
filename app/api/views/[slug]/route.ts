import { NextRequest, NextResponse } from "next/server";
import { getViewCount, incrementViewCount } from "@/lib/views";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  return NextResponse.json({ views: getViewCount(slug) });
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const views = incrementViewCount(slug);
  return NextResponse.json({ views });
}
