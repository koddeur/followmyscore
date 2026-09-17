# FollowMyScore

Application collaborative de suivi de matchs de football amateur en direct : scores, buts,
compositions, historique des mises à jour et commentaires.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **PostgreSQL** via **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Auth.js v5** (email/username + mot de passe, ou Google/Facebook, sessions JWT)
- **Tailwind CSS v4**

## À propos de l'API FFF

`api-dofa.fff.fr` est le backend privé utilisé par le site de la FFF, pas une API publique
documentée. Les requêtes depuis l'environnement de dev de ce projet (sandbox Claude) sont
bloquées en **403 Forbidden** — probablement un filtrage bot/IP plutôt qu'une vraie auth —
mais **ça fonctionne confirmé depuis un réseau résidentiel classique** (testé le
2026-09-14). Selon où tourne ton serveur Next.js en prod (Vercel, VPS...), ça peut ou non
passer : à tester.

Endpoints câblés dans `src/lib/fff.ts` (`.json?filter=` en suffixe) :

| Besoin | Endpoint |
| --- | --- |
| Infos club | `/api/clubs/{clubId}` |
| Équipes d'un club | `/api/clubs/{clubId}/equipes` ✅ format confirmé |
| Calendrier / matchs / résultats club | `/api/clubs/{clubId}/{calendrier,matchs,resultat}` |
| Match précis | `/api/match_entities/{matchId}` |
| Matchs d'une équipe | `/api/clubs/{clubId}/equipes/{teamId}/matchs` ✅ format confirmé + mappé |
| Calendrier / résultats équipe | `/api/clubs/{clubId}/equipes/{teamId}/{calendrier,resultat}` |
| Classement / calendrier / résultats compétition | `/api/compets/{compId}/phases/{phaseId}/poules/{poolId}/{...}` |

Seules `/equipes` et `equipes/{teamId}/matchs` ont un vrai payload observé et un mapping
(`getFffTeamMatchSummaries` dans `src/lib/fff.ts`) ; les autres renvoient du JSON brut non
typé tant que personne n'a testé leur forme réelle.

**Pour l'activer en local** : passe `FFF_API_ENABLED="true"` dans `.env` (désactivé par
défaut). La page `/matches/new` affiche alors un import "Chercher les matchs" : tu donnes
un numéro de club FFF (visible dans l'URL de sa fiche sur le site FFF) et un numéro
d'équipe (1 = senior première en général), ça liste les prochains matchs et un bouton
"Importer" crée le match (avec les deux clubs, liés par leur `fffId`) dans l'app.

Si `FFF_API_ENABLED` reste à `false` (ou si l'API ne répond pas depuis ton réseau), la
page retombe entièrement sur la **création manuelle de matchs**, comme demandé au départ.

## Connexion Google / Facebook

En plus de l'email/mot de passe, l'inscription et la connexion sont possibles via Google et
Facebook (`src/auth.ts`). Un compte OAuth sans mot de passe est créé (ou lié à un compte
existant de même email) automatiquement à la première connexion — pas d'écran d'inscription
séparé pour ces fournisseurs.

Ces boutons ne fonctionnent que si les variables suivantes sont renseignées dans `.env` (le
fichier `.env.example` n'a pas pu être modifié automatiquement — ajoute-les toi-même) :

```
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_FACEBOOK_ID=...
AUTH_FACEBOOK_SECRET=...
```

Sans ces variables, les fournisseurs correspondants sont inertes (le bouton redirige vers une
page d'erreur Auth.js) — le reste du site n'est pas affecté.

**Google** (gratuit) : [Google Cloud Console](https://console.cloud.google.com/) → crée un
projet → *APIs & Services* → *Credentials* → *Create Credentials* → *OAuth client ID* → type
*Web application* → ajoute comme *Authorized redirect URI* :
`https://TON_DOMAINE/api/auth/callback/google` (`http://localhost:3000/api/auth/callback/google`
en local). Le Client ID / Client Secret générés vont dans `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

**Facebook** (gratuit) : [Meta for Developers](https://developers.facebook.com/) → crée une
app (type *Consumer*) → ajoute le produit *Facebook Login* → dans ses réglages, ajoute comme
*Valid OAuth Redirect URI* : `https://TON_DOMAINE/api/auth/callback/facebook`
(`http://localhost:3000/api/auth/callback/facebook` en local). L'App ID / App Secret (dans
*Paramètres* → *Général*) vont dans `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET`.

Apple (Sign in with Apple) n'est pas câblé : ça nécessite un compte développeur Apple payant
(99$/an) et une configuration plus lourde (Services ID, clé privée .p8).

## Rôles

- **USER** : peut créer un match, mettre à jour le score/statut, saisir les compositions
  d'équipe, ajouter les buts/cartons/remplacements et poster des commentaires. Ajouter un
  but incrémente automatiquement le score.
- **ADMIN** : en plus, peut modifier ou supprimer un match, supprimer un club, gérer le rôle
  des autres utilisateurs (`/admin/users`) et consulter/traiter les messages de contact
  (`/admin/contact-messages`).

Tout le site est consultable sans compte. Se connecter est requis pour mettre à jour un
match ou commenter.

## Démarrage local

Prérequis : Node.js 20.9+, PostgreSQL.

```bash
npm install
cp .env.example .env   # renseigne DATABASE_URL et AUTH_SECRET (npx auth secret)
npx prisma migrate dev
npx tsx prisma/seed.ts # comptes et match de démo
npm run dev
```

Comptes créés par le seed (mot de passe `password123`) :

| Email | Rôle |
| --- | --- |
| admin@live-score.test | ADMIN |
| editeur@live-score.test | USER |
| supporter@live-score.test | USER |

## Déploiement (Vercel)

1. Crée une base Postgres managée (Neon, Supabase, ou Vercel Postgres).
2. Configure `DATABASE_URL` et `AUTH_SECRET` dans les variables d'environnement Vercel.
3. Exécute les migrations contre la base de prod : `npx prisma migrate deploy`.
4. Déploie normalement (`vercel --prod` ou intégration Git).

Le client Prisma est généré dans `generated/prisma` (ignoré par git, régénéré au build via
`prisma generate`, appelé automatiquement par le script `postinstall`).

## Notes techniques

- Prisma 7 sépare la config CLI (`prisma.config.ts`, `DATABASE_URL`) du client applicatif,
  qui se connecte via un driver adapter (`src/lib/prisma.ts`).
- Les mises à jour "en direct" utilisent la revalidation Next.js après chaque action serveur
  + un rafraîchissement client léger (`LiveRefresher`, toutes les 20s) sur les matchs en
  cours. Pas de WebSocket : suffisant pour du amateur, à remplacer par Pusher/Ably si le
  besoin de vrai temps réel apparaît.
