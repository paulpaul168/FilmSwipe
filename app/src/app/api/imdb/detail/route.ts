import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

type SuggestionItem = {
  y?: number;
};

type SuggestionResponse = {
  d?: SuggestionItem[];
};

export async function GET(req: Request) {
  try {
    await requireUser();
  } catch {
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

  const ttMatch = parsed.pathname.match(/\/title\/(tt\d+)/);
  if (!ttMatch) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const ttId = ttMatch[1];
  const url = `https://v2.sg.media-imdb.com/suggestion/x/${ttId}.json`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "IMDb fetch failed" }, { status: 502 });
    }

    const data = (await res.json()) as SuggestionResponse;
    const year = data.d?.[0]?.y;
    const releaseDate = year ? `${year}-01-01` : null;

    return NextResponse.json({ releaseDate });
  } catch (e) {
    console.error("IMDb detail error:", e);
    return NextResponse.json({ error: "IMDb fetch failed" }, { status: 502 });
  }
}
