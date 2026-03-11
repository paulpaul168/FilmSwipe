import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupOwner } from "@/lib/groupAccess";

export async function DELETE(
  _req: Request,
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

    await assertGroupOwner(movie.groupId, user.id);

    await prisma.movie.delete({ where: { id: movieId } });

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
