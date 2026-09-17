import Link from "next/link";

export const metadata = {
  title: "Page introuvable — FollowMyScore",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-16 text-center">
      <div
        aria-hidden="true"
        className="h-16 w-12 -rotate-6 rounded-md bg-red-600 shadow-sm dark:bg-red-500"
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Carton rouge</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Cette page a été expulsée du terrain — ou n&apos;a jamais existé. Vérifie l&apos;adresse,
          ou reprends le jeu depuis l&apos;accueil.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/clubs"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          Rechercher un club
        </Link>
      </div>
    </div>
  );
}
