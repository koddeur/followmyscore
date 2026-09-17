"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/users", label: "Utilisateurs" },
    { href: "/admin/clubs", label: "Clubs" },
    { href: "/admin/matches", label: "Matchs" },
    { href: "/admin/contact-messages", label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
  ];

  return (
    <nav className="mb-6 flex items-center gap-4 border-b border-border text-sm">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "border-b-2 border-accent px-1 pb-3 font-medium text-accent"
                : "border-b-2 border-transparent px-1 pb-3 text-zinc-500 hover:border-accent hover:text-foreground"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
