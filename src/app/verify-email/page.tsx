import Link from "next/link";
import { consumeVerificationToken } from "@/lib/emailVerification";

export const metadata = {
  title: "Vérification de l'email — FollowMyScore",
};

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { token } = await searchParams;

  const result =
    typeof token === "string" && token.length > 0 ? await consumeVerificationToken(token) : "invalid";

  const content = {
    ok: {
      title: "Email vérifié !",
      message: "Ton adresse email est confirmée. Merci !",
    },
    expired: {
      title: "Lien expiré",
      message:
        "Ce lien de vérification a expiré (valable 24h). Renvoie-toi un nouvel email depuis ton compte.",
    },
    invalid: {
      title: "Lien invalide",
      message: "Ce lien de vérification est invalide ou a déjà été utilisé.",
    },
  }[result];

  return (
    <div className="mx-auto max-w-sm text-center">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-2 text-xl font-semibold tracking-tight">{content.title}</h1>
        <p className="mb-6 text-sm text-zinc-500">{content.message}</p>
        <Link
          href="/account"
          className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Aller à mon compte
        </Link>
      </div>
    </div>
  );
}
