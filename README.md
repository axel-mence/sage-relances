# Nudge · Version B (liste par groupes)

Exploration figée de Nudge : la liste des clients rangée en groupes de statut dépliables, au lieu de la table filtrable retenue pour la version finale.

**Démo de la version B : [nudge-git-version-b-groupes-axel-mence.vercel.app](https://nudge-git-version-b-groupes-axel-mence.vercel.app)**

**Version finale (version A) : [nudge-axel-mence.vercel.app](https://nudge-axel-mence.vercel.app)**, code sur la branche [`main`](https://github.com/axel-mence/sage-x-nudge-relance).

> Cas pratique fictif : le cabinet, les clients et les chiffres sont inventés. Aucune donnée réelle.

## Pourquoi cette branche existe

Pendant les itérations UX/UI, deux façons d'afficher la liste des clients ont été construites et comparées sur le rendu réel :

| | Version A (retenue, `main`) | Version B (cette branche) |
| --- | --- | --- |
| Liste | une seule table, façon Stripe | groupes par statut, dépliables |
| Navigation | pastilles de filtre en un clic, tri par urgence | pastilles qui ouvrent le groupe correspondant |
| Lecture | tout est visible, on filtre | on ouvre ce qui compte, « Complets » replié |

La version A a été retenue : avec 24 clients et plus, une table filtrable se parcourt plus vite et garde un seul geste pour tout. La version B est gardée telle quelle pour montrer l'alternative et la décision.

## Ce que contient la version B

- **Tableau de bord** des pièces manquantes du mois, avec l'échéance TVA.
- **Groupes de statut dépliables** (en retard, en attente, relancés, complets), avec compteurs. Leur état ouvert ou fermé est gardé pendant la session.
- **Recherche** par client ou par collaborateur, à côté des pastilles d'état.
- **Complétude** de chaque dossier.
- **Boutons « Voir » et « Relancer »** sur chaque ligne, avec confirmation par toast.
- **Aperçu client** dans un panneau latéral.
- **Temps gagné** de la semaine, en haut du tableau de bord.
- **Design system Nudge v2**, modes clair et sombre.

Elle s'arrête avant les étapes suivantes de la version A : pas de comptes ni de connexion (le tableau de bord s'ouvre directement), pas d'annuaire ni de fiche client, pas de parcours Sage ni de paramètres.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4 (tokens du DS Nudge dans `src/index.css`), API simulée dans `src/api/` à partir de `src/data/clients.json`, tests Vitest, lint oxlint, CI GitHub Actions, hébergement Vercel.

## Lancer la version B en local

Prérequis : [Node.js](https://nodejs.org) en version LTS (20 ou plus) et Git.

1. Cloner le dépôt et se placer sur la branche :
   ```bash
   git clone https://github.com/axel-mence/sage-x-nudge-relance.git
   cd sage-x-nudge-relance
   git switch version-b/groupes
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur de développement, puis ouvrir l'adresse affichée (par défaut http://localhost:5173) :
   ```bash
   npm run dev
   ```

Astuces : `?fail=1` dans l'adresse simule une panne de l'API (écrans d'erreur), `?ds` affiche la page de test des composants.

## Démarche

Projet conçu et construit par **Axel Mencé**, designer, avec **Claude Code**. Chaque piste est développée sur sa branche et comparée sur une preview Vercel. La version retenue passe ensuite par une pull request vérifiée par la CI avant d'être fusionnée dans `main`.
