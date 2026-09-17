import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { OAuthButtons } from "@/components/OAuthButtons";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  const callback = typeof callbackUrl === "string" ? callbackUrl : undefined;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Connexion</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <OAuthButtons callbackUrl={callback} />
        <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>
        <LoginForm callbackUrl={callback} />
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Inscris-toi
        </Link>
      </p>
    </div>
  );
}
