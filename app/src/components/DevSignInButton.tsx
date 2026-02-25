"use client";

import { signIn } from "next-auth/react";

export function DevSignInButton() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <button
      type="button"
      onClick={() => signIn("dev", { skip: "dev", callbackUrl: "/groups" })}
      className="rounded-lg border border-zinc-600 bg-zinc-800 px-6 py-3 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
    >
      Dev sign-in (skip auth)
    </button>
  );
}
