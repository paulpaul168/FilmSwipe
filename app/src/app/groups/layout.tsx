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
      <header className="w-full border-b border-zinc-800 bg-zinc-900/95 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <Link href="/groups" className="text-2xl font-bold tracking-tight text-zinc-100">
            Filmswipe
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-base text-zinc-500">{user.name ?? user.email}</span>
            <Link
              href="/api/auth/signout"
              className="rounded-lg px-4 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
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
