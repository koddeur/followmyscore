export const metadata = {
  title: "Conditions générales d'utilisation — FollowMyScore",
};

export default function CguPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Conditions générales d&apos;utilisation</h1>
      <p className="text-sm text-zinc-500">
        En utilisant FollowMyScore, tu acceptes les conditions décrites ci-dessous. Elles peuvent être
        mises à jour ; la version en vigueur est celle publiée sur cette page.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Objet</h2>
        <p className="text-sm text-zinc-500">
          FollowMyScore est une application communautaire et gratuite de suivi de matchs de football
          amateur. Elle permet de consulter librement les scores et informations de match, et,
          après création d&apos;un compte, d&apos;y contribuer (création de matchs, ajout de buts, cartons,
          changements, compositions, commentaires).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Accès au service</h2>
        <p className="text-sm text-zinc-500">
          La consultation du site est libre et gratuite, sans compte. La contribution (ajout ou
          modification d&apos;informations) nécessite la création d&apos;un compte, également gratuite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Compte utilisateur</h2>
        <p className="text-sm text-zinc-500">
          Tu es responsable de la confidentialité de ton mot de passe et de toute activité effectuée
          depuis ton compte. Les informations fournies à l&apos;inscription (nom, nom d&apos;utilisateur,
          email) doivent être exactes. Tu peux supprimer ton compte à tout moment depuis ta page de
          compte.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Contenu ajouté par les utilisateurs</h2>
        <p className="text-sm text-zinc-500">
          Les scores, événements de match, compositions et commentaires sont ajoutés et modifiables
          par n&apos;importe quel utilisateur connecté — c&apos;est le principe collaboratif du site.
          L&apos;éditeur ne vérifie pas systématiquement l&apos;exactitude de ces informations et ne peut en
          garantir la fiabilité à tout moment.
        </p>
        <p className="text-sm text-zinc-500">
          Tu t&apos;engages à ne publier aucun contenu illicite, diffamatoire, injurieux ou portant
          atteinte aux droits d&apos;un tiers, notamment dans les commentaires. Les administrateurs
          peuvent supprimer tout contenu contrevenant à ces règles, et suspendre ou supprimer un
          compte en cas d&apos;abus répété.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Propriété intellectuelle</h2>
        <p className="text-sm text-zinc-500">
          La structure, le code et la charte graphique du site sont la propriété de l&apos;éditeur. Les
          logos de clubs et données FFF affichés appartiennent à leurs propriétaires respectifs et
          sont utilisés à titre informatif, conformément aux{" "}
          <a href="/mentions-legales" className="text-accent hover:underline">
            mentions légales
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Disponibilité du service</h2>
        <p className="text-sm text-zinc-500">
          Le site est un projet non commercial, fourni « en l&apos;état », sans garantie de
          disponibilité continue. L&apos;éditeur ne saurait être tenu responsable d&apos;une interruption
          temporaire du service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Droit applicable</h2>
        <p className="text-sm text-zinc-500">
          Les présentes conditions sont soumises au droit français. Pour toute question, utilise la{" "}
          <a href="/contact" className="text-accent hover:underline">
            page de contact
          </a>
          .
        </p>
      </section>
    </div>
  );
}
