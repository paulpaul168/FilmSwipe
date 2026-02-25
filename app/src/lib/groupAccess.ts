import { prisma } from "./prisma";

export async function assertGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!member) {
    throw new Error("Forbidden: not a group member");
  }
}

export async function assertGroupOwner(
  groupId: string,
  userId: string
): Promise<void> {
  const group = await prisma.group.findFirst({
    where: { id: groupId, ownerId: userId },
  });
  if (!group) {
    throw new Error("Forbidden: not group owner");
  }
}

export async function isGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return !!member;
}
