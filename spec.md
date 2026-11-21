# Spec · Relance des pièces manquantes (Sage Experience, cas fictif)

> Version 1 · 20/11/2026 · Auteur : Axel Mencé
> Cas pratique fictif pour Sage Experience. Les chiffres et le cabinet sont inventés.
> Liens : Notion « Sage · Relance des pièces manquantes » · Figma « Inspi UI » (pages DS temporaire v1 et Wireframes v1) · FigJam « Cartographie process relance »

---

## 1. Contexte

Un cabinet d'expertise comptable doit récupérer chaque mois les pièces de ses clients (relevés, factures, notes de frais) pour tenir la TVA et préparer la clôture. Aujourd'hui, chaque collaborateur suit les pièces attendues dans son propre Excel et relance par mail, à la main, sans trace partagée. L'associé n'a aucune vue d'ensemble.

Sage Experience se branche sur les outils existants du cabinet. La feature lit les pièces attendues et reçues depuis le logiciel comptable (API simulée dans cette V1) et ajoute la couche de suivi et de relance.

## 2. Utilisateur

**Expert-comptable associé** qui pilote le portefeuille du cabinet (cabinet fictif « Cabinet Lemoine » : 2 associés, 6 collaborateurs, 180 dossiers de TPE).

## 3. Problème

- Aucune vue d'ensemble : l'associé doit demander à chaque collaborateur où en sont les dossiers.
- Les relances sont éparpillées dans les boîtes mail, sans historique partagé.
- Des pièces arrivent la veille de l'échéance : rush, erreurs, risque de pénalités pour le client.

## 4. Objectif et mesure

- **Résultat attendu** : voir en 10 secondes les clients en retard et relancer en un clic, avec l'historique.
- **Mesure du succès** : temps de relance gagné par semaine à l'échelle du cabinet (baseline à mesurer, hypothèse : 3 h par collaborateur et par semaine).

## 5. Périmètre V1

**Dans la V1**
- Écran 01 · Tableau de bord associé : temps gagné, recherche, filtres de statut en un clic + table de tous les clients (format Stripe), avec la complétude de chaque dossier.
- Écran 03 · Fiche client en panneau latéral : pièces attendues, historique, relance individuelle.
- Données mockées en JSON, servies comme une API (couche `api/` qui simule le logiciel comptable).
- Relance simulée : le clic ajoute un événement à l'historique et met à jour le statut, aucun mail réel n'est envoyé.

**Hors périmètre (itérations suivantes)**
- Écran 02 · Sélection multiple et relance groupée.
- Envoi réel de mails ou SMS, modèle de mail éditable, aide à la rédaction IA.
- Assignation à un collaborateur (bouton visible mais désactivé, avec info-bulle « Bientôt »).
- Authentification, rôles, multi-cabinets, choix de la période.
- Persistance serveur (l'état vit côté client pendant la session).

## 6. Parcours

1. L'associé ouvre le tableau de bord. Le temps gagné, les filtres et la liste triée par urgence (en retard d'abord) sont visibles d'emblée.
2. Il filtre la liste en un clic (Tous, En retard, En attente, Relancés, Complets) et / ou cherche un client ou un collaborateur. Les filtres et les titres de colonnes restent visibles pendant le défilement.
3. Il clique sur « Relancer » sur une ligne : la relance est enregistrée, un toast confirme, le statut passe à « Relancée ».
4. Ou il clique sur une ligne ou sur « Voir » : le panneau latéral s'ouvre à droite, la liste reste visible derrière.
5. Dans le panneau, il voit les pièces attendues (reçues cochées), l'historique, et peut relancer pour les pièces manquantes.
6. Il ferme le panneau (croix, clic sur le fond, touche Échap).

## 7. Écrans

### 01 · Tableau de bord associé
- **Barre latérale** : nom du cabinet, navigation (Tableau de bord actif ; les autres entrées sont visibles mais inactives).
- **En-tête** : titre « Pièces manquantes », sous-titre période et échéance TVA. Le bouton « Relancer tous les retards » est hors V1 (masqué).
- **Temps gagné** mis en avant à droite du titre, sans carte (les 3 autres cartes KPI ont été retirées le 21/11/2026, à la demande d'Axel).
- **Recherche** par nom de client ou de collaborateur (sans tenir compte des accents). La barre de répartition en dégradé (note N2) a été retirée le 21/11/2026, à la demande d'Axel.
- **Filtres de statut en un clic** : pastilles Tous, En retard, En attente, Relancés, Complets avec compteur, sur la même ligne que la recherche (format Stripe). Ils se combinent avec la recherche.
- **Table plate au format Stripe** (décision d'Axel du 21/11/2026, remplace les groupes dépliables de la note N1) : tous les clients dans une seule liste, lignes séparées par un filet.
- **Colonnes** : Client (+ collaborateur) · Statut (badge) · Complétude (jauge + % de pièces reçues) · Pièces manquantes (nombre + résumé dès 1536 px) · Échéance · Dernière relance (dès 1280 px) · boutons « Voir » et « Relancer ».
- **Tri par urgence** : en retard, en attente, relancés, complets ; à statut égal, échéance la plus proche puis nombre de pièces manquantes décroissant.
- **Scroll collant** (grand écran) : la barre de recherche et de filtres et les titres de colonnes restent visibles pendant le défilement.

### 03 · Fiche client (panneau latéral)
- Largeur 440 px, ancré à droite, fond légèrement assombri derrière.
- En-tête : nom du client, collaborateur, régime de TVA, croix.
- Badge de statut + échéance (« dépassée de 2 jours » si en retard).
- Complétude : « n pièces reçues sur N » + jauge et pourcentage.
- **Pièces attendues de la période** : liste avec case cochée si reçue (texte grisé).
- **Historique des relances** : timeline du plus récent au plus ancien.
- Actions : « Relancer (n pièces) » (primaire) · « Assigner » (secondaire, désactivé en V1).

## 8. États

| Élément | Vide | Chargement | Erreur | Succès |
| --- | --- | --- | --- | --- |
| Liste | « Aucun dossier pour cette période » ; filtre ou recherche sans résultat : message + « Voir tous les clients » | Squelettes de lignes (6) | Bandeau « Impossible de récupérer les dossiers » + Réessayer | Lignes affichées |
| KPI | « 0 » | Squelettes | « Indisponible » | Valeurs |
| Relance | Bouton désactivé si 0 pièce manquante | Bouton en chargement | Toast d'erreur, statut inchangé | Toast « Relance envoyée à {client} », statut « Relancée », événement ajouté |
| Panneau | Pièces : « Toutes les pièces sont reçues » | Squelette | Message + Réessayer | Contenu |

L'API simulée ajoute une latence de 400 à 800 ms et un échec aléatoire activable (`?fail=1`) pour démontrer les états.

## 9. Données

### Modèle

```ts
type DocumentStatus = "recue" | "manquante";
type DossierStatus = "complet" | "en_attente" | "en_retard" | "relancee";

interface Collaborateur { id: string; nom: string; }

interface PieceAttendue {
  id: string;
  libelle: string;          // "Relevé bancaire novembre"
  statut: DocumentStatus;
  recueLe?: string;         // ISO date
}

interface Relance {
  id: string;
  date: string;             // ISO datetime
  par: string;              // nom du collaborateur ou "Système"
  pieces: string[];         // ids des pièces concernées
  canal: "mail";
}

interface Client {
  id: string;
  nom: string;
  collaborateurId: string;
  regimeTva: "mensuelle" | "trimestrielle";
  echeance: string;         // ISO date
  pieces: PieceAttendue[];
  relances: Relance[];
}
```

### Règle de statut (calculée, jamais stockée)

1. Toutes les pièces reçues → `complet`
2. Sinon, dernière relance il y a moins de 3 jours → `relancee`
3. Sinon, échéance dépassée → `en_retard`
4. Sinon → `en_attente`

La relance récente passe avant le retard (décision du 21/11/2026) : sinon, relancer un client en retard ne changerait pas son statut, ce qui contredit le parcours et les critères d'acceptation. Sans réponse du client sous 3 jours, il redevient « En retard ».

### API simulée

| Méthode | Endpoint | Rôle |
| --- | --- | --- |
| GET | `/api/clients?statut=en_retard` | Liste filtrée + statut calculé |
| GET | `/api/clients/:id` | Détail d'un client |
| GET | `/api/kpis` | Les 4 indicateurs |
| POST | `/api/clients/:id/relances` | Enregistre une relance (pièces manquantes) |

Jeu de données : 24 clients fictifs, répartis pour donner des compteurs crédibles (environ 6 en retard, 7 en attente, 3 relancés, 8 complets). Les KPI affichent les chiffres du cabinet complet (180 dossiers) via un facteur fixe, documenté dans le code.

## 10. Design system (temporaire v1)

Source : Figma, page « DS temporaire (v1) ». Bichromie noir et vert, inspirée de Bonsai.

| Token | Valeur |
| --- | --- |
| `bg/page` | #F7F7F7 |
| `bg/surface` | #FFFFFF |
| `border/default` | #E5E5E5 |
| `text/primary` | #111111 |
| `text/secondary` | #6B6B67 |
| `text/muted` | #9A9A95 |
| `accent/default` | #56A538 |
| `accent/hover` | #3F8A2A |
| `accent/subtle` | #EEF6EA |
| `status/attente` / bg | #B26B00 / #FFF3DD |
| `status/retard` / bg | #C2382D / #FDECEA |
| `status/relancee` / bg | #111111 / #EDEDED |

- Typo : Inter. 24 Semi Bold (titre page), 18 Semi Bold (section), 14 Regular (corps), 13 Medium (libellés), 12 Regular (légendes), 28 Semi Bold (chiffres KPI).
- Espacements : 4, 8, 12, 16, 24, 32, 48. Rayons : 6, 8, 12.
- Composants : Badge statut (4 variantes), Bouton (primaire, secondaire), Carte KPI, Ligne client, Panneau latéral.

## 11. Stack proposée

- React + TypeScript + Vite, CSS via Tailwind (tokens ci-dessus dans la config).
- API simulée : fonctions dans `src/api/` qui lisent `src/data/clients.json` avec latence.
- Tests : Vitest pour la règle de statut et l'API simulée.
- CI : GitHub Actions (lint + tests + build).
- Preview : Vercel sur chaque PR.

À confirmer avec Jean : la stack réelle de Sage Experience (si Next.js, la structure s'adapte facilement).

## 12. Étapes de construction (validées une par une)

1. Initialiser le projet, Git, `CLAUDE.md`, branche `feature/relance-pieces`.
2. Tokens du DS dans Tailwind + composants de base (Badge, Bouton, Carte KPI).
3. Données mockées + API simulée + règle de statut, avec tests.
4. Écran 01 : barre latérale, en-tête, KPI.
5. Écran 01 : onglets de statut + tableau + tri.
6. Relance depuis la ligne (toast, mise à jour du statut, historique).
7. Écran 03 : panneau latéral (pièces, historique, relance).
8. États vide, chargement, erreur.
9. Finition UX/UI (mon œil) et mise à jour du DS en v2.
10. CI, push, PR avec description produit, preview.

Un commit par étape au minimum, message au format `feat(scope): description`.

## 13. Critères d'acceptation

- [ ] À l'ouverture, le filtre « Tous » est actif et la liste est triée par urgence (en retard en premier).
- [ ] Un clic sur une pastille filtre la liste ; les compteurs des pastilles correspondent aux lignes affichées.
- [ ] Les filtres et les titres de colonnes restent visibles pendant le défilement.
- [ ] La complétude de chaque dossier correspond aux pièces reçues sur les pièces attendues.
- [ ] « Relancer » sur une ligne passe le statut à « Relancée », met « Dernière relance » à « À l'instant » et ajoute un événement visible dans le panneau.
- [ ] Un client complet n'a pas de bouton « Relancer » actif.
- [ ] Le panneau s'ouvre au clic sur une ligne et se ferme avec la croix, le fond ou Échap.
- [ ] Les états vide, chargement et erreur sont visibles (via `?fail=1` pour l'erreur).
- [ ] Contraste AA sur textes et badges, navigation clavier sur les filtres, les lignes et les boutons.
- [ ] La CI passe (lint, tests, build) et la PR a une preview.

## 14. Risques et questions ouvertes

| # | Question | À qui | Ce que ça débloque |
| --- | --- | --- | --- |
| Q1 | Le logiciel comptable expose-t-il les pièces reçues via API, et à quelle fréquence ? | Dev (Benjamin) | Synchro réelle vs import |
| Q2 | Qui envoie la relance : associé, collaborateur ou système ? | Associé | Droits et parcours |
| Q3 | Quel canal touche le mieux les clients : mail, SMS, portail ? | Associé, collaborateurs | Format de la relance |
| Q4 | Combien de temps prend une relance aujourd'hui ? | Collaborateurs | Baseline du gain |

Risques : statut faux si la synchro des pièces reçues est en retard (afficher « Mis à jour il y a x min ») ; relances perçues comme du harcèlement par le client (plafond de fréquence à prévoir) ; données personnelles et bancaires dans les pièces (RGPD, aucune pièce stockée dans la feature, seulement leur statut).
