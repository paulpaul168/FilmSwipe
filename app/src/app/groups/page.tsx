import Link from "next/link";
import { CopyInviteButton } from "./CopyInviteButton";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function GroupsPage() {
  const user = await requireUser();
  const groups = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
          owner: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Groups</h1>
          <Link
            href="/groups/new"
            className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400"
          >
            Create group
          </Link>
        </div>

        {groups.length === 0 ? (
          <p className="text-zinc-400">
            No groups yet. Create one or join via invite link.
          </p>
        ) : (
          <ul className="space-y-4">
            {groups.map((gm) => (
              <li
                key={gm.groupId}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/groups/${gm.groupId}`}
                      className="font-medium hover:underline"
                    >
                      {gm.group.name}
                    </Link>
                    <p className="text-sm text-zinc-500">
                      {gm.group._count.members} member
                      {gm.group._count.members !== 1 ? "s" : ""} · Owner:{" "}
                      {gm.group.owner.name ?? "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CopyInviteButton token={gm.group.inviteToken} />
                    <Link
                      href={`/groups/${gm.groupId}`}
                      className="rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
                    >
                      Enter
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
