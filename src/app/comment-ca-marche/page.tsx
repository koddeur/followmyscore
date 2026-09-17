import Link from "next/link";

export const metadata = {
  title: "Comment ça marche — FollowMyScore",
  description: "Comment suivre et participer à l'édition des matchs de football amateur sur FollowMyScore.",
};

const steps = [
  {
    title: "Crée ton compte (1 minute)",
    description:
      "Nom, nom d'utilisateur, email, mot de passe : c'est tout ce qu'il faut. Aucune validation par email n'est nécessaire, tu peux commencer à contribuer immédiatement.",
  },
  {
    title: "Trouve ou crée un match",
    description:
      "Recherche un club depuis l'accueil ou la barre de recherche, ou crée un nouveau match manuellement. Tu peux aussi importer directement les informations d'un match à venir depuis la base officielle de la FFF (club, catégorie, adversaire, date, lieu).",
  },
  {
    title: "Mets le match à jour en direct",
    description:
      "Une fois connecté, démarre le match, ajoute les buts (buteur, passeur, pénalty, csc), les cartons, signale la mi-temps et la fin de match. La page se rafraîchit automatiquement toutes les 20 secondes pour tous ceux qui la consultent.",
  },
  {
    title: "Complète les informations autour du match",
    description:
      "Renseigne les compositions d'équipe, corrige la compétition, le lieu ou l'horaire si besoin, et échange avec les autres spectateurs dans les commentaires.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Comment ça marche</h1>
        <p className="text-sm text-zinc-500">
          FollowMyScore permet de suivre gratuitement et publiquement tous les matchs de football
          amateur, et de participer à leur édition grâce à une communauté de supporters, joueurs et
          bénévoles de club.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Suivre un match</h2>
        <p className="text-sm text-zinc-500">
          Aucun compte n&apos;est nécessaire pour consulter les scores, les buts, les cartons, les
          compositions et les commentaires d&apos;un match : l&apos;accès est libre et gratuit pour tout le
          monde. Recherche un club par son nom pour retrouver ses matchs, ou consulte les matchs en
          cours et les plus suivis directement depuis l&apos;accueil.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Participer à l&apos;édition d&apos;un match</h2>
        <p className="text-sm text-zinc-500">
          Les informations affichées sur FollowMyScore sont ajoutées et corrigées par la communauté :
          n&apos;importe quel utilisateur connecté peut créer un match, saisir le score, les buts, les
          cartons et les compositions, ou corriger une erreur. Il n&apos;y a pas de rôle réservé à un
          club ou à un administrateur pour ça — plus il y a de monde pour suivre un match, plus les
          informations sont fiables et rapides à mettre à jour.
        </p>
        <p className="text-sm text-zinc-500">
          Pour éviter les doublons quand plusieurs personnes suivent le même match en même temps,
          un avertissement s&apos;affiche si un but ou un carton similaire vient d&apos;être ajouté il y a
          moins de 90 secondes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">En pratique</h2>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-sm text-zinc-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Une question, un souci ?</h2>
        <p className="text-sm text-zinc-500">
          Si tu as une question, si tu constates un abus ou une erreur que tu n&apos;arrives pas à
          corriger toi-même, contacte le support depuis la{" "}
          <Link href="/contact" className="font-medium text-accent hover:underline">
            page de contact
          </Link>
          .
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Link
          href="/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Créer mon compte
        </Link>
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          Voir les matchs
        </Link>
      </div>
    </div>
  );
}
