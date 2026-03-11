import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url || !url.includes("imdb.com/title/tt")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

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
