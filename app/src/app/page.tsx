import Link from "next/link";
import { auth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { error, callbackUrl } = params;

  if (session?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-zinc-100">
        <h1 className="text-3xl font-bold">Filmswipe</h1>
        <p className="text-zinc-400">Welcome, {session.user.name ?? session.user.email}</p>
        <Link
          href="/groups"
          className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-zinc-950 hover:bg-amber-400"
        >
          My Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-4xl font-bold">Filmswipe</h1>
      {error && (
        <div className="max-w-md rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-200">
          <p className="font-medium">Sign-in failed. Please try again.</p>
        </div>
      )}
      <p className="max-w-md text-center text-zinc-400">
        Group movie nights made simple. Create a group, submit movies, swipe to
        rate, and see what everyone wants to watch.
      </p>
      <GoogleSignInButton callbackUrl={callbackUrl} />
    </div>
  );
}
