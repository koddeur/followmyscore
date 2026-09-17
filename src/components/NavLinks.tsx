"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

interface NavUser {
  name?: string | null;
  username?: string | null;
  role?: string | null;
}

export function NavLinks({
  user,
  variant = "desktop",
  onNavigate,
}: {
  user: NavUser | null;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  const isMobile = variant === "mobile";
  const linkClass = isMobile
    ? "rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-background hover:text-foreground"
    : "text-zinc-500 hover:text-foreground";

  if (!user) {
    const content = (
      <Link href={loginHref} onClick={onNavigate} className={linkClass}>
        Connexion
      </Link>
    );
    return isMobile ? <div className="flex flex-col gap-1">{content}</div> : content;
  }

  const content = (
    <>
      {user.role === "ADMIN" && (
        <Link href="/admin/users" onClick={onNavigate} className={linkClass}>
          Administration
        </Link>
      )}
      <Link href={`/users/${user.username}`} onClick={onNavigate} className={linkClass}>
        {user.name}
      </Link>
      <form action={logout} onSubmit={onNavigate}>
        <button className={`${linkClass} ${isMobile ? "w-full text-left" : ""}`} type="submit">
          Déconnexion
        </button>
      </form>
    </>
  );

  return isMobile ? <div className="flex flex-col gap-1">{content}</div> : content;
}
