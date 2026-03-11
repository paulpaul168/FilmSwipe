"use client";

import { signIn } from "next-auth/react";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/groups" })}
      className="rounded-lg bg-amber-500 px-8 py-4 font-medium text-zinc-950 hover:bg-amber-400"
    >
      Continue with Google
    </button>
  );
}
