"use client";

import { useState } from "react";

export function CopyInviteButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${token}`
      : "";

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    const u = url || (typeof window !== "undefined" ? `${window.location.origin}/join/${token}` : "");
    if (!u) return;
    await navigator.clipboard.writeText(u);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
    >
      {copied ? "Copied!" : "Copy invite"}
    </button>
  );
}
