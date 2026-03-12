import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

const LIMITS: [string, number][] = [
  ["/api/imdb", 60],
  ["/api", 120],
];

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < WINDOW_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of store) {
    if (now > bucket.resetAt) store.delete(key);
  }
}

function limitFor(pathname: string): number {
  for (const [prefix, limit] of LIMITS) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return 60;
}

function bucketPrefix(pathname: string): string {
  for (const [prefix] of LIMITS) {
    if (pathname.startsWith(prefix)) return prefix;
  }
  return "/api";
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  cleanup();

  const now = Date.now();
  const ip = clientIp(req);
  const key = `${ip}:${bucketPrefix(pathname)}`;
  const limit = limitFor(pathname);

  let bucket = store.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, limit - bucket.count);
  const resetSec = String(Math.ceil(bucket.resetAt / 1000));

  if (bucket.count > limit) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetSec,
        },
      },
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(limit));
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  res.headers.set("X-RateLimit-Reset", resetSec);
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
