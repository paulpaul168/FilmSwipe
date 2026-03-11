import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect(`/?callbackUrl=${encodeURIComponent(`/join/${token}`)}`);
  }

  const group = await prisma.group.findUnique({
    where: { inviteToken: token },
  });

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-zinc-100">
        <h1 className="text-2xl font-bold">Invalid invite link</h1>
        <p className="text-zinc-400">This invite token is invalid or expired.</p>
        <Link
          href="/groups"
          className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-zinc-950 hover:bg-amber-400"
        >
          Back to groups
        </Link>
      </div>
    );
  }

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
  });

  if (existing) {
    redirect(`/groups/${group.id}`);
  }

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: user.id,
      role: "MEMBER",
    },
  });

  redirect(`/groups/${group.id}`);
}
