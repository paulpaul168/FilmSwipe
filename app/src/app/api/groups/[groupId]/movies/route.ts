import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { normalizeMovieKey } from "@/lib/normalizeMovieKey";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .nullish(),
  imdbUrl: z.string().nullish(),
  note: z.string().max(1000).nullish(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireUser();
    await assertGroupMember(groupId, user.id);

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json(
        { error: "Invalid input", details: issues },
        { status: 400 }
      );
    }

    const { title } = parsed.data;
    const year = parsed.data.year ?? null;
    const rawImdb = parsed.data.imdbUrl?.trim();
    const imdbUrl =
      rawImdb && /^https?:\/\//.test(rawImdb) ? rawImdb : null;
    const note = parsed.data.note?.trim() || null;
    const normalizedKey = normalizeMovieKey(title, year);

    try {
      const movie = await prisma.movie.create({
        data: {
          groupId,
          title: title.trim(),
          year,
          imdbUrl: imdbUrl || null,
          note: note || null,
          normalizedKey,
          createdById: user.id,
        },
      });
      return NextResponse.json({ movieId: movie.id });
    } catch (e: unknown) {
      const prismaError = e as { code?: string };
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "This movie already exists in the group" },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw e;
  }
}
