# Spec · Nudge · Clients et Relances

> Version 1.1 · 21/11/2026 · Auteur : Axel Mencé
> 1.1 : le panneau latéral reste sur le tableau de bord, la page client devient une page à part (annuaire « Clients »). Décision d'Axel après l'étape 4.
> Complète [spec.md](spec.md) (tableau de bord, règle de statut, DS). En cas de doute sur ces 2 features, ce fichier fait foi.
> Références retenues : [refs-clients-relances/CONTEXTE.md](refs-clients-relances/CONTEXTE.md).
> Cas fictif : cabinet, clients, contacts et chiffres inventés. Aucun mail réel n'est envoyé.

---

## Partie 1 · Clients (fiche client)

### 1. Pourquoi

Aujourd'hui, la fiche client est un panneau latéral de 440 px. Il suffit pour relancer, mais pas pour comprendre un dossier : on y voit seulement les relances, pas les pièces reçues ni les actions du cabinet, et on ne peut pas relire un mail envoyé.

**Résultat attendu** : en ouvrant un client, le collaborateur voit d'un coup d'œil où en est le dossier, tout ce qui s'est passé (et quand), puis relance sans doublon.

### 2. Décisions (questions 1 à 6)

| # | Question | Décision | Note d'Axel appliquée |
|---|---|---|---|
| 1 | Où vit la fiche ? | **Page dédiée** en 2 colonnes, **à part du tableau de bord**. Le panneau latéral reste l'aperçu rapide du tableau de bord, avec un bouton « Détail » vers la page (révision 1.1). | Attio « top » : activité à gauche, détails à droite |
| 2 | Que montre la colonne de gauche ? | **2 onglets** : « Activité » (tous les événements) et « Mails envoyés (n) » avec « Voir le mail » | Shopify « top pour historique » : timeline datée, groupée par jour |
| 3 | En-tête et colonne de droite ? | **Version simple** : pièces de la période, contact, entreprise, dernière relance | Dub « Parfait pour client » : blocs sobres et empilés |
| 4 | Navigation ? | **Adresse propre**, entrée « Clients » vers un **annuaire** (révision 1.1), retour avec l'état conservé, **précédent / suivant** dans la liste d'origine | Attio : Companies → fiche, flèches ↑ ↓ « 3 sur 6 » |
| 5 | États et cas limites ? | Validés tels que listés en section 6 | |
| 6 | Données et hors périmètre ? | Validés tels que listés en sections 7 et 9 | |

### 3. Parcours

1. Deux chemins mènent à la page client :
   - **Tableau de bord** : le collaborateur clique sur une ligne (ou « Voir ») ; le panneau s'ouvre à droite pour un aperçu rapide. Le bouton **« Détail »** ouvre la page client.
   - **Barre latérale → Clients** : l'annuaire liste tous les clients par ordre alphabétique, avec une recherche. Un clic ouvre la page client.
2. La page client s'ouvre à l'adresse `/clients/garage-peyrot`. Le focus est placé sur le nom du client.
3. Il lit l'état du dossier dans la colonne de droite (complétude, pièces manquantes, dernière relance) et l'historique à gauche.
4. Il clique sur « Relancer (2 pièces) » : l'aperçu du mail s'ouvre (PR #7). S'il a déjà relancé aujourd'hui, l'aperçu le lui signale en tête.
5. Il envoie : un toast confirme, l'événement apparaît en tête de l'activité, « Dernière relance » passe à « À l'instant ».
6. Il passe au client suivant avec la flèche ↓ (« 2 sur 6 · En retard »), sans revenir à la liste.
7. Il revient d'où il vient (« ‹ Tableau de bord » ou « ‹ Clients », ou retour du navigateur) : il retrouve son filtre, sa recherche et sa position.

### 4. Écran · Fiche client

#### En-tête (pleine largeur)

```
‹ Clients                                         ↑ ↓  2 sur 6 · En retard
Garage Peyrot   [En retard]                       [✉ Lui écrire] [Relancer (2 pièces)]
Échéance le 16 novembre · dépassée de 5 jours
```

- Retour « ‹ Clients » (Dub) et flèches précédent / suivant avec la position dans la liste filtrée (Attio).
- Nom en Sora (style Titre page du DS), badge de statut, échéance relative (rouge si dépassée).
- Actions en haut à droite (Attio « Compose Email ») : « Lui écrire » (secondaire, Outlook web) et « Relancer (n pièces) » (primaire, ouvre l'aperçu du mail).

#### Colonne de gauche · Historique (environ 2/3 de la largeur)

Onglets (composant à créer à partir des tokens du DS, voir section 8) :

**Activité** : tous les événements, groupés par jour (« Aujourd'hui », « Hier », « 18 novembre »), du plus récent au plus ancien. Chaque ligne : picto, phrase, heure à droite (Shopify).

| Événement | Phrase | Action |
|---|---|---|
| Relance manuelle | « Claire Lemoine a relancé Marc Peyrot pour 2 pièces » | **Voir le mail** |
| Relance automatique (feature Relances) | « Relance automatique J+3 envoyée à Marc Peyrot » | **Voir le mail** |
| Pièce reçue | « Relevé bancaire octobre reçu » | |
| Ouverture du dossier | « Dossier d'octobre ouvert · 4 pièces attendues » | |

**Mails envoyés (n)** : uniquement les relances, même présentation. « Voir le mail » déplie le mail sous la ligne : destinataire, objet, message.

#### Colonne de droite · Détails (environ 1/3, blocs empilés façon Dub)

1. **Dernière relance** : « Il y a 3 jours · par Claire Lemoine », ou « Jamais relancé ». En premier, pour éviter les doublons.
2. **Pièces d'octobre 2026** : complétude (jauge + %, seuils de couleur existants), puis une ligne par pièce : « Reçue le 18 nov. » (grisée) ou « Manquante » (couleur retard).
3. **Contact** : nom, e-mail (sélectionnable d'un clic).
4. **Entreprise** : collaborateur en charge, régime de TVA, client depuis.

#### Mobile et tablette

Une seule colonne : en-tête (actions sur une ligne pleine largeur), puis les blocs de droite, puis l'historique. Les flèches précédent / suivant restent dans l'en-tête.

### 5. Navigation

- Adresses : `/` pour le tableau de bord, `/clients` pour l'annuaire, `/clients/:slug` pour la page client (slug tiré du nom : `garage-peyrot`). Sans bibliothèque de routage : on utilise l'historique du navigateur (History API).
- Barre latérale : **« Tableau de bord »** et **« Clients »** (active sur l'annuaire et sur les pages clients). Sur mobile, les 2 pages sont en onglets sous la barre du haut.
- **Annuaire** : table simple (client, contact, collaborateur, statut, complétude), tri alphabétique, recherche par client, contact ou collaborateur. Cartes sur mobile.
- Retour : vers la page d'origine (« ‹ Tableau de bord » ou « ‹ Clients »), avec filtre, recherche et position de défilement conservés. Lien partagé : retour vers l'annuaire.
- Précédent / suivant : suivent l'ordre de la page d'origine au moment du clic (liste filtrée du tableau de bord, ou annuaire). Fiche ouverte depuis un lien partagé : on parcourt tous les clients dans l'ordre de gravité.
- Raccourcis clavier : `J` / `K` pour suivant / précédent (comme Attio), `Échap` ne fait rien sur la page (il ferme seulement l'aperçu du mail).

### 6. États et cas limites

| Cas | Comportement |
|---|---|
| Chargement | Squelette des 2 colonnes (blocs animés en surface-2) |
| Erreur | « Fiche indisponible » + **Réessayer** (testable avec `?fail=1`) |
| Client introuvable | « Ce client n'existe pas ou plus » + **Retour aux clients** |
| Succès d'une relance | Toast, événement en tête de l'activité, « Dernière relance » à « À l'instant », statut « Relancé », compteur « Mails envoyés » + 1 |
| Échec d'une relance | Toast d'erreur, l'aperçu reste ouvert, rien ne change |
| Activité vide | « Rien pour l'instant. Les relances et les pièces reçues apparaîtront ici. » |
| Mails envoyés vide | « Aucun mail envoyé à ce client. » + **Relancer** |
| Jamais relancé | « Jamais relancé » dans le bloc Dernière relance |
| Dossier complet | « Relancer » désactivé (« Rien à relancer »), badge « Complet », jauge à 100 % |
| Relance déjà envoyée aujourd'hui | L'aperçu affiche en tête « Dernière relance aujourd'hui à 14:58 » (Acctual). Pas de blocage. |
| Premier / dernier client | Flèche précédent / suivant désactivée |
| Historique long | Groupé par jour, la page défile normalement |

Accessibilité : onglets au clavier (flèches gauche / droite, rôles `tablist` / `tab` / `tabpanel`), focus sur le titre à l'ouverture, « Voir le mail » annoncé comme déplié ou replié (`aria-expanded`), contraste AA.

### 7. Données

Ajouts au modèle de [spec.md](spec.md), section 9 :

```ts
interface Relance {
  // … champs existants
  objet: string;    // objet réellement envoyé
  message: string;  // message réellement envoyé (retouches comprises)
  mode: "manuelle" | "automatique";
  etape?: string;   // « J+3 » pour une relance automatique (feature Relances)
}

interface Client {
  // … champs existants
  clientDepuis: string; // date ISO
}

// Calculé, jamais stocké (comme le statut)
type Evenement =
  | { type: "ouverture"; date: string; nbPieces: number }
  | { type: "piece_recue"; date: string; piece: PieceAttendue }
  | { type: "relance"; date: string; relance: Relance };
```

- L'activité est **calculée** à partir de l'ouverture du dossier (1er jour du mois qui suit la période), des pièces reçues (`recueLe`) et des relances. Elle ne peut donc pas contredire le reste de la fiche.
- Les relances déjà présentes dans `clients.json` reçoivent un objet et un message reconstitués avec le modèle actuel (`composeRelance`). Les nouvelles gardent le texte exact envoyé.
- API simulée : `getClientBySlug(slug)`. `postRelance(id, { objet, message })` enregistre désormais le contenu du mail.

### 8. Design system

Réutilisation : Button, StatusBadge, Completude, Avatar, NavIcon, toasts, squelettes, aperçu du mail. Tokens existants uniquement.

**À valider par Axel avant de coder** (nouveaux composants, faits uniquement avec les tokens du DS) :
- **Onglets** : libellé Inter Medium 14, compteur en caption, soulignement accent de 2 px sous l'onglet actif, filet `border` sous la rangée.
- **Ligne de timeline** : picto 16 px dans une pastille `surface-2`, phrase en body, heure en caption muted, filet vertical `border` qui relie les événements.
- **Flèches précédent / suivant** : 2 boutons secondaires carrés de 32 px.

### 9. Hors périmètre (Clients)

- Onglets Notes, Tâches et Fichiers d'Attio.
- Modification des infos du client depuis la fiche.
- Assignation à un collaborateur (reste « Bientôt »).
- Consultation ou téléchargement des pièces elles-mêmes (on suit leur statut, pas leur contenu : RGPD).
- Périodes précédentes : seulement la période en cours.
- Séquence automatique : partie 2. La fiche affichera ses événements quand elle existera.

### 10. Critères d'acceptation

- [ ] Tableau de bord : un clic sur une ligne (ou « Voir ») ouvre le panneau à droite ; « Détail » ouvre la page `/clients/:slug`.
- [ ] « Clients » (barre latérale) ouvre l'annuaire ; un clic sur un client ouvre sa page. Le retour du navigateur ramène à la page d'origine.
- [ ] Au retour, le filtre, la recherche et la position de défilement sont conservés.
- [ ] Précédent / suivant parcourent la liste filtrée et affichent « n sur N · filtre ». Les flèches sont désactivées aux extrémités.
- [ ] L'onglet Activité liste l'ouverture du dossier, les pièces reçues et les relances, groupées par jour, de la plus récente à la plus ancienne.
- [ ] L'onglet Mails envoyés affiche le nombre de relances. « Voir le mail » montre l'objet et le message réellement envoyés.
- [ ] Une relance envoyée depuis la fiche apparaît immédiatement en tête de l'activité, et « Dernière relance » passe à « À l'instant ».
- [ ] L'aperçu du mail signale une relance déjà envoyée le jour même.
- [ ] Les états chargement, erreur, client introuvable et vides sont visibles.
- [ ] Mobile : une colonne, sans défilement horizontal.
- [ ] Clavier : onglets aux flèches, `J` / `K`, focus visible. Contraste AA en clair et en sombre.
- [ ] Lint, tests (activité calculée, slug, précédent / suivant) et build passent. La PR vise `main`, avec le lien Vercel.

### 11. Étapes de construction (validées et livrées)

1. Données : `clientDepuis`, contenu des relances, activité calculée + tests.
2. Navigation : adresses, retour avec état conservé, annuaire « Clients », bouton « Détail » du panneau.
3. Page fiche : en-tête et colonne de droite.
4. Historique : onglets Activité et Mails envoyés, « Voir le mail ».
5. Précédent / suivant et raccourcis `J` / `K`.
6. États (chargement, erreur, introuvable, vides) et mobile.

---

## Partie 2 · Relances

À rédiger après la livraison de la partie 1 (questions une par une, comme pour Clients). Références retenues : HoneyBook (« Relance envoyée le … » sous le statut), Midday et Acctual (relance en panneau, « Dernier envoi »), Attio (séquence : fenêtre d'envoi, jours ouvrés, critère de sortie « pièce reçue », note « Mail parfait »).
