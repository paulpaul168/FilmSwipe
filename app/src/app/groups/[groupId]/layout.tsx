import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { InviteLink } from "./InviteLink";
import { GroupNav } from "./GroupNav";

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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            {group.name}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {group._count.members} member{group._count.members !== 1 ? "s" : ""}
          </p>
        </div>
        <InviteLink token={group.inviteToken} />
      </div>
      <GroupNav base={base} />
      {children}
    </div>
  );
}
