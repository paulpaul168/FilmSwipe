import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { InviteLink } from "./InviteLink";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });

  if (!group) notFound();

  try {
    await assertGroupMember(groupId, user.id);
  } catch {
    redirect("/groups");
  }

  const base = `/groups/${groupId}`;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">{group.name}</h2>
        <p className="text-sm text-zinc-500">{group._count.members} members</p>
      </div>
      <InviteLink token={group.inviteToken} />
      <nav className="mb-8 flex gap-4 border-b border-zinc-800 pb-4">
        <Link
          href={`${base}/movies`}
          className="text-zinc-400 hover:text-zinc-100"
        >
          Movies
        </Link>
        <Link
          href={`${base}/swipe`}
          className="text-zinc-400 hover:text-zinc-100"
        >
          Swipe
        </Link>
        <Link
          href={`${base}/ranking`}
          className="text-zinc-400 hover:text-zinc-100"
        >
          Ranking
        </Link>
      </nav>
      {children}
    </div>
  );
}
