import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AvatarUploadForm } from "@/components/AvatarUploadForm";
import { UpdateProfileForm } from "@/components/UpdateProfileForm";
import { UpdateEmailForm } from "@/components/UpdateEmailForm";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";

export default async function AccountPage() {
  const sessionUser = await requireUser("/login?callbackUrl=/account");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const hasPassword = user.passwordHash !== null;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon compte</h1>
        <p className="text-sm text-zinc-500">Gère tes informations personnelles et ta sécurité.</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Photo de profil</h2>
        <div className="rounded-2xl border border-border bg-card p-6">
          <AvatarUploadForm avatarUrl={user.avatarUrl} name={user.name} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Profil</h2>
        <div className="rounded-2xl border border-border bg-card p-6">
          <UpdateProfileForm name={user.name} username={user.username} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Email</h2>
        <div className="rounded-2xl border border-border bg-card p-6">
          <UpdateEmailForm
            email={user.email}
            hasPassword={hasPassword}
            emailVerified={user.emailVerified !== null}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mot de passe</h2>
        <div className="rounded-2xl border border-border bg-card p-6">
          <UpdatePasswordForm hasPassword={hasPassword} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-red-600">Zone dangereuse</h2>
        <div className="rounded-2xl border border-red-200 bg-card p-6 dark:border-red-900">
          <p className="mb-4 text-sm text-zinc-500">
            Supprime définitivement ton compte. Tes commentaires seront supprimés ; les
            matchs, buts, cartons et compositions que tu as renseignés restent visibles
            pour la communauté mais ne seront plus attribués à ton compte.
          </p>
          <DeleteAccountForm hasPassword={hasPassword} />
        </div>
      </section>
    </div>
  );
}
