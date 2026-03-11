import Link from "next/link";
import { auth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { DevSignInButton } from "@/components/DevSignInButton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { error, error_description, callbackUrl } = params;

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
          <p className="font-medium">Sign-in failed</p>
          <p className="mt-2 font-mono text-sm">error: {error}</p>
          {error_description && (
            <p className="mt-1 font-mono text-sm">error_description: {error_description}</p>
          )}
          <div className="mt-3 flex gap-4 text-sm">
            <Link href="/auth/diagnose" className="text-amber-400 hover:underline">
              Auth diagnostic →
            </Link>
            <Link
              href={`/auth/error?error=${encodeURIComponent(error)}${error_description ? `&error_description=${encodeURIComponent(error_description)}` : ""}`}
              className="text-zinc-500 hover:underline"
            >
              Error details
            </Link>
          </div>
        </div>
      )}
      <p className="max-w-md text-center text-zinc-400">
        Group movie nights made simple. Create a group, submit movies, swipe to
        rate, and see what everyone wants to watch.
      </p>
      <div className="flex flex-col items-center gap-4">
        <GoogleSignInButton callbackUrl={callbackUrl} />
        <DevSignInButton />
      </div>
    </div>
  );
}
