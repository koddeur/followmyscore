"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

interface NavUser {
  name?: string | null;
  username?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
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
  const iconButtonClass =
    "flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-border text-zinc-500 hover:border-accent hover:text-foreground";

  if (!user) {
    const content = isMobile ? (
      <Link href={loginHref} onClick={onNavigate} className={linkClass}>
        Connexion
      </Link>
    ) : (
      <Link
        href={loginHref}
        onClick={onNavigate}
        className="flex h-9 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-accent bg-accent px-3 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Connexion
      </Link>
    );
    return isMobile ? <div className="flex flex-col gap-1">{content}</div> : content;
  }

  const content = (
    <>
      {user.role === "ADMIN" &&
        (isMobile ? (
          <Link href="/admin/users" onClick={onNavigate} className={linkClass}>
            Administration
          </Link>
        ) : (
          <Link
            href="/admin/users"
            onClick={onNavigate}
            aria-label="Administration"
            title="Administration"
            className={iconButtonClass}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            </svg>
          </Link>
        ))}
      {isMobile ? (
        <>
          <Link href={`/users/${user.username}`} onClick={onNavigate} className={linkClass}>
            {user.name}
          </Link>
          <form action={logout} onSubmit={onNavigate}>
            <button className={`${linkClass} w-full text-left`} type="submit">
              Déconnexion
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href={`/users/${user.username}`}
            onClick={onNavigate}
            title={user.name ?? "Profil"}
            className="flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-lg border border-border px-3 text-sm text-zinc-500 hover:border-accent hover:text-foreground"
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            )}
            {user.name}
          </Link>
          <form action={logout} onSubmit={onNavigate}>
            <button type="submit" aria-label="Déconnexion" title="Déconnexion" className={iconButtonClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none h-5 w-5"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </>
      )}
    </>
  );

  return isMobile ? <div className="flex flex-col gap-1">{content}</div> : content;
}
