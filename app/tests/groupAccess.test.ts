import { describe, expect, it, vi } from "vitest";
import { assertGroupMember, assertGroupOwner, isGroupMember } from "@/lib/groupAccess";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    groupMember: {
      findUnique: vi.fn(),
    },
    group: {
      findFirst: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("groupAccess", () => {
  it("assertGroupMember resolves when member exists", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      groupId: "g1",
      userId: "u1",
      role: "MEMBER",
    } as never);

    await expect(assertGroupMember("g1", "u1")).resolves.toBeUndefined();
  });

  it("assertGroupMember throws when not a member", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null);

    await expect(assertGroupMember("g1", "u1")).rejects.toThrow(
      "Forbidden: not a group member"
    );
  });

  it("assertGroupOwner resolves when user is owner", async () => {
    vi.mocked(prisma.group.findFirst).mockResolvedValue({
      id: "g1",
      ownerId: "u1",
    } as never);

    await expect(assertGroupOwner("g1", "u1")).resolves.toBeUndefined();
  });

  it("assertGroupOwner throws when not owner", async () => {
    vi.mocked(prisma.group.findFirst).mockResolvedValue(null);

    await expect(assertGroupOwner("g1", "u1")).rejects.toThrow(
      "Forbidden: not group owner"
    );
  });

  it("isGroupMember returns true when member exists", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      groupId: "g1",
      userId: "u1",
      role: "MEMBER",
    } as never);

    expect(await isGroupMember("g1", "u1")).toBe(true);
  });

  it("isGroupMember returns false when not a member", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null);

    expect(await isGroupMember("g1", "u1")).toBe(false);
  });
});
