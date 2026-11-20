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

## Git

- Branche de travail : `feature/relance-pieces`.
- Commits conventionnels en français, à l'impératif : `feat(scope): description`, `fix(scope): ...`, `chore: ...`, `test(scope): ...`.
- Un commit par étape de construction au minimum (spec, section 12). Pas de commit ni de push sans validation d'Axel.
