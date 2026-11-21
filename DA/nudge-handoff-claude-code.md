# Nudge · Handoff DA pour Claude Code

> À coller dans Claude Code, à la racine du projet MVP (Vite + Tailwind).
> Source Figma : fichier « Sage · Relance pièces · Inspi UI », page « DA », board « Nudge · Propositions DA · v1 ».

## Contexte

Le MVP « Relance des pièces manquantes » devient **Nudge**, un SaaS fictif (non affilié à Sage) qui relance automatiquement les clients des cabinets comptables pour récupérer leurs pièces.
Objectif de cette étape : **rhabiller le MVP existant avec la nouvelle DA**, sans toucher à la logique métier.

Travaille sur une branche dédiée : `feat/da-nudge`. Une PR à la fin, avec captures avant / après.

## 1. Tokens couleur

Ajoute ces variables CSS dans `src/index.css` (ou le fichier global existant) :

```css
:root {
  /* Base */
  --nudge-ink: #090B0B;
  --nudge-surface: #131716;
  --nudge-surface-2: #1C2221;
  --nudge-mist: #F2F4EE;
  --nudge-muted: #8A938F;

  /* Accents */
  --nudge-lime: #D4F53C;   /* action principale */
  --nudge-green: #3DE86B;  /* succès, pièce reçue */
  --nudge-teal: #0F3D3E;   /* blocs secondaires */
  --nudge-alert: #FF7A45;  /* pièce manquante, à relancer */
}
```

Et étends Tailwind (`tailwind.config.js` ou `@theme` si Tailwind v4) :

```js
theme: {
  extend: {
    colors: {
      ink: 'var(--nudge-ink)',
      surface: { DEFAULT: 'var(--nudge-surface)', 2: 'var(--nudge-surface-2)' },
      mist: 'var(--nudge-mist)',
      muted: 'var(--nudge-muted)',
      lime: 'var(--nudge-lime)',
      green: 'var(--nudge-green)',
      teal: 'var(--nudge-teal)',
      alert: 'var(--nudge-alert)',
    },
    fontFamily: {
      display: ['Sora', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
    },
    borderRadius: { card: '24px', tile: '16px', pill: '999px' },
  },
}
```

## 2. Gradients

Deux fonds, repris de la réf TalentSync (noir profond + halo vert émeraude).

```css
.bg-nudge-dark {
  background:
    radial-gradient(35% 45% at 100% 35%, rgba(61,232,107,0.12), transparent 100%),
    radial-gradient(45% 50% at 5% 0%, rgba(26,92,69,0.55), transparent 100%),
    radial-gradient(75% 85% at 50% 105%, rgba(31,122,87,0.95) 0%, rgba(18,74,54,0.6) 45%, transparent 100%),
    #050807;
}

.bg-nudge-light {
  background:
    radial-gradient(35% 45% at 100% 35%, rgba(61,232,107,0.08), transparent 100%),
    radial-gradient(45% 50% at 5% 0%, rgba(228,247,200,0.8), transparent 100%),
    radial-gradient(80% 85% at 50% 105%, rgba(191,235,203,0.9) 0%, rgba(221,243,226,0.6) 45%, transparent 100%),
    #FBFCFA;
}
```

Usage : `bg-nudge-dark` pour le hero, la sidebar ou la page de connexion côté cabinet ; `bg-nudge-light` pour la page de dépôt côté client (mobile).

## 3. Typographie

Charge les polices dans `index.html` :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap" rel="stylesheet">
```

| Rôle | Police | Graisse | Réglage |
|---|---|---|---|
| Titres, chiffres clés, logo | Sora | 600 / 700 | letter-spacing -0.03em à -0.05em |
| Interface, texte courant | Inter | 400 / 500 / 600 | normal |
| Labels de section | Inter | 500 | MAJUSCULES, letter-spacing 0.1em, couleur lime |

## 4. Composants

- **Bouton principal** : fond `lime`, texte `ink`, Inter 600, `rounded-pill`, padding 16px 28px. Sur fond clair : fond `ink`, texte `lime`.
- **Cartes** : fond `surface` (dark) ou `mist` (light), `rounded-card`, pas d'ombre, padding 32 à 40px.
- **Chips de statut** (pill, Inter 600, 13px, texte `ink`) :
  - À relancer → fond `alert`
  - Relancé → fond `lime`
  - Reçu → fond `green`
- **Ligne de pièce manquante** : fond noir à 5 % d'opacité, `rounded-xl`, pastille 8px `alert` à gauche.
- **Chiffre clé** (ex. « 14 h gagnées ») : Sora 700, 96px, `mist` sur fond `teal`.

## 5. Logo

Le logo final est dans Figma (board DA). Exporte-le en SVG et place-le dans `src/assets/` :

- `nudge-mark.svg` : le symbole seul (favicon, avatar, icône d'app)
- `nudge-logo.svg` : symbole + mot « nudge » en Sora Bold

Remplace le favicon par `nudge-mark.svg`. Les couleurs du SVG doivent utiliser `currentColor` ou les variables CSS, pour passer du dark au light sans doubler les fichiers.

## 6. Ton des textes

- Côté client : tutoiement possible, phrases courtes, jamais culpabilisantes.
  Exemple : « Il nous manque 2 pièces pour clôturer octobre. Ça prend 30 secondes. »
- Côté cabinet : vouvoiement, factuel, orienté temps gagné.
- Remplace toute mention de « Sage » dans l'interface par « Nudge ».

## 7. Ordre de travail

1. Créer la branche `feat/da-nudge`.
2. Poser les tokens (couleurs, polices, rayons, gradients) et vérifier que l'app compile.
3. Rhabiller les composants partagés (boutons, cartes, chips) avant les pages.
4. Passer page par page : tableau de bord cabinet (dark), page de dépôt client (light, mobile d'abord).
5. Intégrer le logo et le favicon.
6. Vérifier les contrastes (texte `muted` sur `surface` notamment) et le rendu mobile.
7. Ouvrir la PR avec captures avant / après et la liste des écarts éventuels avec la maquette Figma.

Valide chaque étape avec moi avant de passer à la suivante.
