"use client";

import { useState } from "react";

export function InviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${token}`
      : "";

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <span className="text-sm text-zinc-500">Invite link:</span>
      <code className="flex-1 truncate text-sm text-zinc-300">{url || `/join/${token}`}</code>
      <button
        type="button"
        onClick={copy}
        className="rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
