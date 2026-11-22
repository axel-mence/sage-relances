# CLAUDE.md · Relance des pièces manquantes (Sage Experience, cas fictif)

Complète le `CLAUDE.md` global d'Axel. Specs de référence : [spec.md](spec.md) (tableau de bord) et [spec-clients-relances.md](spec-clients-relances.md) (pages Clients et Relances). En cas de doute, elles font foi.

## Projet

- Feature : tableau de bord associé pour suivre les pièces manquantes des clients d'un cabinet comptable et les relancer en un clic.
- Cas pratique fictif : cabinet, clients et chiffres inventés. Aucune donnée réelle.
- Pages : tableau de bord `/` (aperçu client en panneau latéral), annuaire `/clients`, page client `/clients/:slug`. Relances (séquence automatique) : partie 2 de spec-clients-relances, à venir.
- Comptes (sans serveur) : inscription `/inscription` → `/inscription/code` → `/inscription/cabinet` → connexion Sage `/onboarding/sage` → modale d'invitation. Comptes et session dans le navigateur (localStorage), mot de passe stocké en empreinte SHA-256. Sans session, toute adresse ramène à `/connexion` ; après connexion, écran de chargement (preloader) puis le SaaS. Sage et Google ouvrent un compte de démo. Démo : code `000000` expiré. `/test/preloader` rejoue le preloader.
- Paramètres `/parametres` : compte, logiciel comptable (Sage) et boîte mail (Outlook, Gmail). Connecteurs fictifs : ils ne font que basculer l'état « Connecté » du compte.

## Stack

- React 19 + TypeScript + Vite.
- CSS : Tailwind 4, avec les tokens du DS Nudge v2 (Figma) dans `src/index.css` (variables `--ds-*`, modes clair et sombre). Jamais de couleur, d'espacement ou de rayon en dur.
- Typo : Sora (titres, chiffres) et Inter (interface).
- Navigation : routeur maison sur l'History API (`src/hooks/use-route.ts`), sans bibliothèque. `vercel.json` renvoie toutes les adresses vers `index.html`.
- API simulée : fonctions dans `src/api/` qui lisent `src/data/clients.json`, avec latence de 400 à 800 ms et échec activable via `?fail=1`.
- Tests : Vitest (règle de statut, API simulée).
- Lint : oxlint (`npm run lint`).
- CI : GitHub Actions (lint + tests + build). Preview : Vercel sur chaque PR.

## Commandes

- `npm run dev` : serveur de dev sur localhost.
- `npm run build` : build de production.
- `npm run lint` : vérification du code.
- `npm test` : tests Vitest (règle de statut, API simulée).
- Ajouter `?fail=1` à l'URL fait échouer tous les appels de l'API simulée (`?fail=0.3` : 30 % des appels).

Node est installé dans `~/.local/node` (ajouté au PATH dans `~/.zshrc`).

## Arborescence

```
src/
  api/          API simulée (logiciel comptable, authentification)
  data/         clients.json (24 clients fictifs)
  domain/       types, statut, activité, mail, tri : calculés, jamais stockés (+ tests)
  components/   composants du DS (Button, StatusBadge, Tabs, Timeline, blocs de la fiche, AuthLayout, Preloader…)
  hooks/        useAsync, useRelance (parcours de relance), use-route (navigation)
  screens/      Dashboard, ClientPanel, ClientsDirectory, ClientPage, MailPreview, Login, Signup…, SageConnect, InviteModal
```

## Conventions

- Fichiers en kebab-case, variables et composants en anglais. Les libellés affichés sont en français.
- Les noms métier du modèle de données restent ceux de la spec (`statut`, `pieces`, `relances`, etc.).
- Commentaires en français aux endroits non évidents.
- Accessibilité : contraste AA, navigation clavier sur onglets, lignes, boutons et panneau (Échap ferme le panneau).
- Pas de `console.log` de debug ni de code mort.

## Design system

- DS Nudge v2 (Figma, page « DS Nudge · v2 ») : tokens dans `src/index.css`, modes clair (défaut) et sombre. 2 teintes foncées par rapport à Figma pour le contraste AA (commentées dans le fichier).
- Composants ajoutés pour la page client (validés dans spec-clients-relances, section 8) : onglets, ligne de timeline, flèches précédent / suivant.
- Ne pas créer de nouveau composant ou token sans le proposer à Axel.

## Itération UX/UI (DS v2)

Source : `ameliorations-ui-ux/ameliorations-ui-ux.md` (captures dans `captures/`).

- Les « Notes d'Axel » (N1, N2, N3) font foi. Si une note contredit `spec.md` ou une autre règle, le signaler au lieu de choisir seul.
- Ouvrir les captures avant d'implémenter : reproduire le principe, pas le style de l'app d'origine (le DS du projet fait foi).
- Une étape de la section 5 à la fois : dire ce qui va être fait, le faire, montrer le rendu sur le serveur de dev, attendre la validation d'Axel, puis commiter.
- Un commit par étape validée, avec le message prévu dans le MD (raccourci si le titre dépasse 50 caractères, voir plus bas).

## Git

- Branche de travail : `feature/relance-pieces`.
- Commits conventionnels en français : `type(zone): description` (`feat`, `fix`, `chore`, `test`, `docs`, `style`, `refactor`).
- Titre de 50 caractères maximum, un verbe (« ajoute », « corrige », « simule »), aucun détail technique : les détails vont dans le corps du message.
  - Oui : `feat(relance): ajoute la relance depuis une ligne`
  - Non : `feat(relance): permet de relancer un client depuis sa ligne avec toast et KPI`
- Un commit par étape de construction au minimum (spec, section 12). Pas de commit ni de push sans validation d'Axel.

## Pull requests

- Numéro : attribué automatiquement par GitHub (#1, #2, #3…), dans l'ordre d'ouverture. On ne le répète pas dans le titre.
- Titre : `Catégorie : description claire`, en français, compréhensible sans lire le code.
  - Catégories : `Feature` (nouvelle fonctionnalité), `UX` (parcours, structure, interactions), `UI` (visuel, DA, composants), `Fix` (correction), `Refactor` (code sans changement visible), `Docs`, `Chore` (outillage).
  - Oui : `UI : Navbar avec pictos`, `Feature : Connexion à la boîte mail`
  - Non : `feat/table-filtres`, `Table et filtres : liste au format Stripe`
- Description : contexte, ce qui change, captures, comment tester (lien Vercel), limites connues.
