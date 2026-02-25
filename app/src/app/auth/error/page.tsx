import Link from "next/link";
import { AuthErrorDisplay } from "./AuthErrorDisplay";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-2xl font-bold">Sign-in error</h1>
      <AuthErrorDisplay params={params} />
      <div className="flex gap-4">
        <Link
          href="/auth/diagnose"
          className="rounded-lg border border-amber-600 px-6 py-3 font-medium text-amber-400 hover:bg-amber-950/50"
        >
          Auth diagnostic
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-zinc-950 hover:bg-amber-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
