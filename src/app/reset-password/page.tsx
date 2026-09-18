import Link from "next/link";
import { checkPasswordResetToken } from "@/lib/passwordReset";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata = {
  title: "Réinitialiser le mot de passe — FollowMyScore",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const check =
    typeof token === "string" && token.length > 0
      ? await checkPasswordResetToken(token)
      : { status: "invalid" as const };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Réinitialiser le mot de passe</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        {check.status === "ok" ? (
          <ResetPasswordForm token={token as string} />
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-600">
              {check.status === "expired"
                ? "Ce lien de réinitialisation a expiré (valable 1h)."
                : "Ce lien de réinitialisation est invalide ou a déjà été utilisé."}
            </p>
            <Link
              href="/forgot-password"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Refaire une demande
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
