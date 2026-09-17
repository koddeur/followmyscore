export const metadata = {
  title: "Mentions légales — FollowMyScore",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Mentions légales</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Éditeur du site</h2>
        <p className="text-sm text-zinc-500">
          FollowMyScore est édité par Mael Avennec, à titre personnel et non professionnel.
        </p>
        <p className="text-sm text-zinc-500">
          Conformément à l&apos;article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance
          dans l&apos;économie numérique, l&apos;éditeur, personne physique agissant à titre non
          professionnel, n&apos;est pas tenu de publier son adresse personnelle ; elle est tenue à la
          disposition des autorités judiciaires qui en feraient la demande.
        </p>
        <p className="text-sm text-zinc-500">
          Contact : via la{" "}
          <a href="/contact" className="text-accent hover:underline">
            page de contact
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Directeur de la publication</h2>
        <p className="text-sm text-zinc-500">Mael Avennec.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Hébergement</h2>
        <p className="text-sm text-zinc-500">
          [Hébergeur à compléter — nom, adresse et, le cas échéant, numéro de téléphone de
          l&apos;hébergeur].
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Propriété intellectuelle</h2>
        <p className="text-sm text-zinc-500">
          La structure générale du site, son code et sa charte graphique sont la propriété de
          l&apos;éditeur, sauf mention contraire. Les logos et emblèmes des clubs affichés sur le site
          appartiennent à leurs clubs ou fédérations respectifs et sont utilisés à titre informatif.
        </p>
        <p className="text-sm text-zinc-500">
          Certaines données (clubs, équipes, calendriers) proviennent de l&apos;API publique de la
          Fédération Française de Football (FFF) et sont utilisées à titre informatif, sans lien
          officiel avec la FFF.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Contenu communautaire</h2>
        <p className="text-sm text-zinc-500">
          Les scores, événements de match, compositions et commentaires affichés sur le site sont
          ajoutés et modifiés par les utilisateurs de la communauté. L&apos;éditeur ne garantit pas
          l&apos;exactitude, la complétude ni l&apos;actualité de ces informations et ne saurait être tenu
          responsable des erreurs qu&apos;elles pourraient contenir. Tout signalement d&apos;un contenu
          abusif peut être fait depuis la{" "}
          <a href="/contact" className="text-accent hover:underline">
            page de contact
          </a>
          .
        </p>
      </section>
    </div>
  );
}
