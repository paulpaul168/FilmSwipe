"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "swipe", label: "Swipe" },
  { href: "movies", label: "Movies" },
  { href: "ranking", label: "Ranking" },
] as const;

export function GroupNav({ base }: { base: string }) {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 rounded-xl bg-zinc-900/80 p-1.5">
      {tabs.map(({ href, label }) => {
        const path = `${base}/${href}`;
        const isActive = pathname === path || pathname.startsWith(path + "/");
        return (
          <Link
            key={href}
            href={path}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${isActive
              ? "bg-amber-500 text-zinc-950 shadow-sm"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
