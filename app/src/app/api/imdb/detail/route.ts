import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  try { await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url") ?? "";

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (
    parsed.protocol !== "https:" ||
    !["www.imdb.com", "imdb.com"].includes(parsed.hostname) ||
    !parsed.pathname.startsWith("/title/tt")
  ) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const url = parsed.toString();

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Filmswipe/1.0; +https://github.com/filmswipe)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "IMDb fetch failed" }, { status: 502 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let releaseDate: string | null = null;

    const ldJson = $('script[type="application/ld+json"]').first().html();
    if (ldJson) {
      try {
        const ld = JSON.parse(ldJson);
        if (ld.datePublished) {
          releaseDate = ld.datePublished;
        }
      } catch {}
    }

    return NextResponse.json({ releaseDate });
  } catch (e) {
    console.error("IMDb detail error:", e);
    return NextResponse.json({ error: "IMDb fetch failed" }, { status: 502 });
  }
}
