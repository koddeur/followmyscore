export const metadata = {
  title: "Protection des données (RGPD) — FollowMyScore",
};

export default function RgpdPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Protection des données personnelles</h1>
      <p className="text-sm text-zinc-500">
        Cette page décrit, conformément au Règlement Général sur la Protection des Données (RGPD),
        quelles données sont collectées sur FollowMyScore, pourquoi, et comment les exercer.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Responsable du traitement</h2>
        <p className="text-sm text-zinc-500">
          Mael Avennec, éditeur du site, joignable via la{" "}
          <a href="/contact" className="text-accent hover:underline">
            page de contact
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Données collectées</h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-500">
          <li>
            <strong className="text-foreground">Compte utilisateur</strong> : nom, nom
            d&apos;utilisateur, email et mot de passe (stocké sous forme hachée, jamais en clair) lors
            de la création d&apos;un compte, ainsi qu&apos;une photo de profil si tu choisis d&apos;en
            ajouter une.
          </li>
          <li>
            <strong className="text-foreground">Contributions</strong> : les matchs, buts, cartons,
            changements, compositions et commentaires que tu ajoutes sont associés à ton compte.
          </li>
          <li>
            <strong className="text-foreground">Formulaire de contact</strong> : nom, email et message
            que tu saisis, uniquement pour traiter ta demande.
          </li>
          <li>
            <strong className="text-foreground">Session de connexion</strong> : un cookie strictement
            nécessaire au maintien de ta connexion (aucun cookie publicitaire ou de mesure
            d&apos;audience tiers).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Cookies</h2>
        <p className="text-sm text-zinc-500">
          FollowMyScore n&apos;utilise qu&apos;un seul cookie, strictement nécessaire au fonctionnement
          du site. Conformément aux recommandations de la CNIL, ce type de cookie ne nécessite pas
          ton consentement — seule une information est requise, c&apos;est l&apos;objet de cette section
          et du bandeau affiché lors de ta première visite.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-zinc-500">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Finalité</th>
                <th className="py-2">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0">
                <td className="py-2 pr-4 font-mono text-xs">authjs.session-token</td>
                <td className="py-2 pr-4 text-zinc-500">Maintenir ta connexion à ton compte</td>
                <td className="py-2 text-zinc-500">30 jours ou jusqu&apos;à déconnexion</td>
              </tr>
              <tr className="border-b border-border last:border-0">
                <td className="py-2 pr-4 font-mono text-xs">authjs.callback-url</td>
                <td className="py-2 pr-4 text-zinc-500">
                  Technique, utilisé pendant le processus de connexion
                </td>
                <td className="py-2 text-zinc-500">Session du navigateur</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-zinc-500">
          Aucun cookie de mesure d&apos;audience, publicitaire ou de réseau social tiers n&apos;est
          déposé.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Ce que nous ne faisons pas</h2>
        <p className="text-sm text-zinc-500">
          FollowMyScore n&apos;utilise aucun outil de suivi publicitaire ni de revente de données à des
          tiers. Le compteur de vues sur les matchs est un compteur agrégé, il ne trace pas
          individuellement les visiteurs.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Finalité et base légale</h2>
        <p className="text-sm text-zinc-500">
          Ces données sont traitées pour permettre la création de compte, la contribution aux
          matchs, la modération du contenu par les administrateurs, et la réponse aux demandes de
          contact — sur la base de l&apos;exécution du service que tu demandes en créant un compte ou
          en nous contactant.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Durée de conservation</h2>
        <p className="text-sm text-zinc-500">
          Les données de compte sont conservées tant que le compte existe. Les messages du
          formulaire de contact sont conservés le temps nécessaire au traitement de la demande. La
          suppression d&apos;un compte entraîne l&apos;anonymisation ou la suppression des données
          associées, selon les cas décrits ci-dessous.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Tes droits</h2>
        <p className="text-sm text-zinc-500">
          Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, d&apos;opposition et de portabilité sur tes données :
        </p>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-500">
          <li>
            Nom, nom d&apos;utilisateur, email, mot de passe et photo de profil : modifiables
            directement depuis ta{" "}
            <a href="/account" className="text-accent hover:underline">
              page de compte
            </a>
            .
          </li>
          <li>
            Suppression complète du compte : disponible directement depuis la page de compte, à
            tout moment.
          </li>
          <li>
            Pour toute autre demande (accès à l&apos;ensemble de tes données, portabilité, question
            sur un traitement) : passe par la{" "}
            <a href="/contact" className="text-accent hover:underline">
              page de contact
            </a>
            .
          </li>
        </ul>
        <p className="text-sm text-zinc-500">
          Quand un compte est supprimé, les matchs qu&apos;il a créés sont conservés (ils appartiennent
          à la communauté) mais sont détachés de son auteur, et ses commentaires sont supprimés.
        </p>
        <p className="text-sm text-zinc-500">
          Tu disposes également du droit d&apos;introduire une réclamation auprès de la CNIL
          (www.cnil.fr) si tu estimes que tes droits ne sont pas respectés.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Données provenant de la FFF</h2>
        <p className="text-sm text-zinc-500">
          Les informations de clubs (noms, logos, coordonnées, noms et fonctions des membres du
          bureau) affichées sur les pages de club proviennent de l&apos;annuaire public de la Fédération
          Française de Football, à titre informatif. Ces données ne sont pas collectées par nos
          soins auprès des personnes concernées.
        </p>
      </section>
    </div>
  );
}
