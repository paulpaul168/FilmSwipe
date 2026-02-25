import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({ name: z.string().min(1).max(200) });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid name" },
        { status: 400 }
      );
    }

    const inviteToken = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    const group = await prisma.group.create({
      data: {
        name: parsed.data.name.trim(),
        ownerId: user.id,
        inviteToken,
      },
    });

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    return NextResponse.json({ groupId: group.id });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
