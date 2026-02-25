import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.length > 200) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const encoded = encodeURIComponent(q);
  const url = `https://www.imdb.com/find/?q=${encoded}&s=tt`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Filmswipe/1.0; +https://github.com/filmswipe)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "IMDb search failed" },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const results: { title: string; year: string | null; url: string }[] = [];
    const seen = new Set<string>();

    $('a[href*="/title/tt"]').each((_, el) => {
      if (results.length >= 10) return false;
      const $el = $(el);
      const href = $el.attr("href");
      const text = $el.text().trim();
      if (!href || !text || text.length < 2) return;

      const ttMatch = href.match(/\/title\/(tt\d+)/);
      if (!ttMatch) return;
      const ttId = ttMatch[1];
      if (seen.has(ttId)) return;
      seen.add(ttId);

      const match = text.match(/^(.+?)\s*\((\d{4})\)\s*$/);
      const title = match ? match[1].trim() : text;
      const year = match ? match[2] : null;

      const fullUrl = href.startsWith("http")
        ? href
        : `https://www.imdb.com${href.split("?")[0]}`;

      results.push({ title, year, url: fullUrl });
    });

    return NextResponse.json({ results });
  } catch (e) {
    console.error("IMDb search error:", e);
    return NextResponse.json(
      { error: "IMDb search failed" },
      { status: 502 }
    );
  }
}
