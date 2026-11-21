/*
  Pictos de la barre latérale, au trait fin (style des apps type n8n).
  Tracés en currentColor : ils prennent la couleur du texte du lien (DS Nudge, clair ou sombre).
*/
const PATHS = {
  // Maison : tableau de bord
  home: 'M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5Z',
  // Deux silhouettes : clients
  clients:
    'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2 .8 3.5 2.6 3.5 5.6',
  // Avion en papier : relances envoyées
  relances: 'M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4Z',
  // Immeuble : cabinet
  cabinet: 'M4.5 20.5v-15a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M14.5 9.5h4a1 1 0 0 1 1 1v10M2.5 20.5h19M8 8.5h3M8 12h3M8 15.5h3',
  // Curseurs : paramètres
  parametres: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  // Point d'interrogation cerclé : aide
  aide: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.4v.6M12 17h.01',
} as const

export type NavIconName = keyof typeof PATHS

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
