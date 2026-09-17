import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isFffEnabled } from "@/lib/fff";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { FffImportPanel } from "@/components/FffImportPanel";

export default async function NewMatchPage() {
  await requireUser("/login?callbackUrl=/matches/new");

  const clubs = await prisma.club.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
    distinct: ["name"],
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {isFffEnabled() && (
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">Importer depuis la FFF</h1>
          <p className="mb-6 text-sm text-zinc-500">
            Cherche les prochains matchs d&apos;une équipe via l&apos;API FFF et
            importe-les directement.
          </p>
          <div className="rounded-2xl border border-border bg-card p-6">
            <FffImportPanel />
          </div>
        </div>
      )}

      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          {isFffEnabled() ? "Ou crée un match manuellement" : "Nouveau match"}
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          {isFffEnabled()
            ? "Si ton match n'est pas trouvable via la FFF, renseigne-le manuellement."
            : "Les données de la FFF ne sont pas accessibles depuis cet environnement : renseigne le match manuellement."}{" "}
          Les clubs sont créés automatiquement s&apos;ils n&apos;existent pas encore.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6">
          <CreateMatchForm clubNames={clubs.map((c) => c.name)} />
        </div>
      </div>
    </div>
  );
}
