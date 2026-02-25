import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/groups" className="text-xl font-bold text-zinc-100">
            Filmswipe
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user.name ?? user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
