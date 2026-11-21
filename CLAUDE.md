# CLAUDE.md · Relance des pièces manquantes (Sage Experience, cas fictif)

Complète le `CLAUDE.md` global d'Axel. La spec de référence est [spec.md](spec.md) : en cas de doute, elle fait foi.

## Projet

- Feature : tableau de bord associé pour suivre les pièces manquantes des clients d'un cabinet comptable et les relancer en un clic.
- Cas pratique fictif : cabinet, clients et chiffres inventés. Aucune donnée réelle.
- V1 : écran 01 (tableau de bord) + écran 03 (fiche client en panneau latéral). Le reste est hors périmètre (voir spec, section 5).

## Stack

- React 19 + TypeScript + Vite.
- CSS : Tailwind, avec les tokens du DS v1 (spec, section 10) déclarés dans la config. Jamais de couleur, d'espacement ou de rayon en dur.
- Typo : Inter.
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

## Arborescence visée

```
src/
  api/          API simulée (logiciel comptable)
  data/         clients.json (24 clients fictifs)
  domain/       types et règle de statut (calculée, jamais stockée)
  components/   Badge, Button, KpiCard, ClientRow, SidePanel
  screens/      Dashboard, ClientPanel
```

## Conventions

- Fichiers en kebab-case, variables et composants en anglais. Les libellés affichés sont en français.
- Les noms métier du modèle de données restent ceux de la spec (`statut`, `pieces`, `relances`, etc.).
- Commentaires en français aux endroits non évidents.
- Accessibilité : contraste AA, navigation clavier sur onglets, lignes, boutons et panneau (Échap ferme le panneau).
- Pas de `console.log` de debug ni de code mort.

## Design system

- v1 : spec, section 10. Tokens dans `src/index.css` (bloc `@theme`), avec 3 teintes foncées pour le contraste AA (commentées dans le fichier).
- v2 en cours : `ameliorations-ui-ux/ameliorations-ui-ux.md`, section 4. Ajouts : dégradé `bg-gradient-retard` (barre de répartition uniquement), chiffres tabulaires dans les tableaux et KPI.
- Bichromie noir et vert pour tout le reste. Aucune autre couleur que le noir, le vert et les statuts.

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
