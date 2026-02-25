import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { z } from "zod";

const bodySchema = z.object({
  value: z.enum(["LIKE", "SUPERLIKE", "SUPERDISLIKE"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const { movieId } = await params;
    const user = await requireUser();

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { groupId: true },
    });
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    await assertGroupMember(movie.groupId, user.id);

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    await prisma.rating.upsert({
      where: {
        movieId_userId: { movieId, userId: user.id },
      },
      create: {
        movieId,
        userId: user.id,
        value: parsed.data.value,
      },
      update: { value: parsed.data.value },
    });

    return NextResponse.json({ ok: true });
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
