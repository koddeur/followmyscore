import { auth } from "@/auth";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";

export async function EmailVerificationBanner() {
  const session = await auth();
  if (!session?.user || session.user.isEmailVerified) return null;

  return (
    <div className="border-b border-border bg-card px-4 py-2 text-center text-sm text-zinc-500">
      Vérifie ton adresse email pour sécuriser ton compte. <ResendVerificationButton />
    </div>
  );
}
