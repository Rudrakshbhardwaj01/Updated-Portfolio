import { NextResponse } from "next/server";
import { getRedis, isKvConfigured, VISITOR_COUNT_KEY } from "@/lib/visitor";

export const dynamic = "force-dynamic";

async function readCount(): Promise<number> {
  const redis = getRedis();
  if (!redis) {
    return 0;
  }

  const count = await redis.get<number>(VISITOR_COUNT_KEY);
  return typeof count === "number" ? count : 0;
}

export async function GET() {
  try {
    const count = await readCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST() {
  try {
    if (!isKvConfigured()) {
      return NextResponse.json({ count: 0 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ count: 0 });
    }

    const count = await redis.incr(VISITOR_COUNT_KEY);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
