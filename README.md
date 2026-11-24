# Nudge

Nudge suit les pièces manquantes des clients d'un cabinet comptable et les relance en un clic.

**Démo : [nudge-axel-mence.vercel.app](https://nudge-axel-mence.vercel.app)**
Identifiants démo fournis sur demande.

> Cas pratique fictif : le cabinet, les clients et les chiffres sont inventés. Aucune donnée réelle.

## Le problème

Chaque mois, un expert-comptable attend des dizaines de pièces de ses clients : relevés bancaires, factures, notes de frais. Savoir qui a envoyé quoi, qui est en retard et qui relancer se fait souvent à la main, dans un tableur et une boîte mail. Nudge rassemble ce suivi sur un seul écran et réduit chaque relance à un clic.

## Fonctionnalités

- **Tableau de bord** : la liste des clients avec leur statut (en retard, en attente, relancé, complet), leur complétude et l'échéance. Filtre par statut, tri par complétude ou par nombre de pièces manquantes, et temps gagné de la semaine.
- **Relance en un clic** : aperçu du mail prérempli avec les pièces manquantes, puis envoi (simulé).
- **Aperçu client** dans un panneau latéral, sans quitter la liste.
- **Annuaire des clients** et **fiche client** avec l'historique des échanges et des relances.
- **Comptes** : inscription, code de vérification, profil du cabinet, connexion.
- **Connexion à Sage** : parcours d'autorisation et d'import des dossiers (simulé).
- **Paramètres** : compte, logiciel comptable et boîte mail (connecteurs simulés).
- **Mode clair et mode sombre**, navigation au clavier, contrastes AA.

## Stack

- **React 19** et **TypeScript**, avec **Vite**.
- **Tailwind CSS 4**, avec les tokens du design system Nudge (Figma) dans `src/index.css`.
- **Navigation** : petit routeur maison sur l'History API, sans bibliothèque.
- **Données** : API simulée dans `src/api/` (clients lus depuis `src/data/clients.json`, avec une latence réaliste). Les comptes sont enregistrés dans le navigateur.
- **Compte démo** : vérifié par une fonction serveur Vercel (`api/demo-login.ts`), avec des identifiants rangés dans les variables d'environnement.
- **Qualité** : tests **Vitest**, lint **oxlint**, CI **GitHub Actions** (lint, tests, build).
- **Hébergement** : **Vercel**, avec une preview sur chaque pull request.

Ce qui reste simulé : l'envoi réel des mails, la connexion à l'API Sage et à Outlook ou Gmail. Le code passe déjà par `src/api/`, qu'il suffira de brancher sur les vrais services.

## Installation en local

Prérequis : [Node.js](https://nodejs.org) en version LTS (20 ou plus) et Git.

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/axel-mence/sage-x-nudge-relance.git
   cd sage-x-nudge-relance
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. (Facultatif) Activer le compte démo : copier `.env.example` en `.env.local` et choisir un email et un mot de passe.
   ```bash
   cp .env.example .env.local
   ```
4. Lancer le serveur de développement, puis ouvrir l'adresse affichée (par défaut http://localhost:5173) :
   ```bash
   npm run dev
   ```

Sans compte démo, on peut créer un compte depuis l'écran d'inscription.

Autres commandes :

| Commande | Rôle |
| --- | --- |
| `npm test` | lance les tests |
| `npm run lint` | vérifie le code |
| `npm run build` | construit la version de production |

Astuce : ajouter `?fail=1` à l'adresse fait échouer les appels de l'API simulée, pour voir les écrans d'erreur.

## Démarche

Projet conçu et construit par **Axel Mencé**, designer, avec **Claude Code**.

Le travail a suivi le même chemin qu'en équipe produit : cadrage, références, spec (`spec.md`, `spec-clients-relances.md`), design system dans Figma, puis du code livré par petites étapes. Chaque étape a sa branche, ses commits, une pull request vérifiée par la CI et une preview Vercel, puis elle est fusionnée dans `main`.
