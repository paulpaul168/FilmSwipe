import NextAuth, { getServerSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { AuthOptions } from "next-auth";

const isDev = process.env.NODE_ENV === "development";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: isDev,
  logger: isDev
    ? {
        error(code, ...args) {
          console.error("\n\n=== NEXTAUTH ERROR ===\n", code, ...args, "\n========================\n\n");
        },
        warn(code, ...args) {
          console.warn("[NextAuth warn]", code, ...args);
        },
        debug(code, ...args) {
          console.log("[NextAuth debug]", code, ...args);
        },
      }
    : undefined,
  pages: { signIn: "/", error: "/auth/error" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    ...(isDev
      ? [
          Credentials({
            id: "dev",
            name: "Dev (skip auth)",
            credentials: {
              skip: { label: "Skip", type: "hidden" },
            },
            async authorize() {
              const user = await prisma.user.upsert({
                where: { email: "dev@local" },
                update: {},
                create: {
                  email: "dev@local",
                  name: "Dev User",
                  image: null,
                },
              });
              return { id: user.id, email: user.email, name: user.name, image: user.image };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) (token as { id?: string }).id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { id?: string }).id = (token as { id?: string }).id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export async function auth() {
  return getServerSession(authOptions);
}

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as { id?: string; email?: string | null; name?: string | null; image?: string | null };
  return {
    id: u.id ?? (u.email ? await resolveUserIdByEmail(u.email) : null) ?? "",
    email: u.email ?? null,
    name: u.name ?? null,
    image: u.image ?? null,
  };
}

async function resolveUserIdByEmail(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  return user;
}
