import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { OAuthButtons } from "@/components/OAuthButtons";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Créer un compte</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <OAuthButtons />
        <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
