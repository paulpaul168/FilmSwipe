"use client";

import { useState, useEffect } from "react";

export function InviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/join/${token}`;
  const [url, setUrl] = useState(path);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copy() {
    const toCopy = url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${path}`;
    if (!toCopy) return;
    await navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <span className="text-sm text-zinc-500">Invite link:</span>
      <code className="flex-1 truncate text-sm text-zinc-300">{url}</code>
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
