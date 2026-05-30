import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

type SuggestionItem = {
  id?: string;
  l?: string;
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
  const q = searchParams.get("q");
  if (!q || q.length > 200) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const url = `https://v2.sg.media-imdb.com/suggestion/t/${encodeURIComponent(q)}.json`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "IMDb search failed" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as SuggestionResponse;
    const results = (data.d ?? [])
      .filter((item): item is SuggestionItem & { id: string; l: string } =>
        Boolean(item.id?.startsWith("tt") && item.l),
      )
      .slice(0, 10)
      .map((item) => ({
        title: item.l,
        year: item.y ? String(item.y) : null,
        url: `https://www.imdb.com/title/${item.id}/`,
      }));

    return NextResponse.json({ results });
  } catch (e) {
    console.error("IMDb search error:", e);
    return NextResponse.json(
      { error: "IMDb search failed" },
      { status: 502 },
    );
  }
}
