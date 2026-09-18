import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié — FollowMyScore",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Indique ton email, on t&apos;envoie un lien pour choisir un nouveau mot de passe.
      </p>
      <div className="rounded-2xl border border-border bg-card p-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
