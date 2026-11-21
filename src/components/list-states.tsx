import { Button } from './button'

// États de la liste des clients (spec, section 8)

const SKELETON_ROWS = 6

// Chargement : 6 lignes grises qui pulsent, à la place des clients
export function ListSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-2">
      <span className="sr-only">Chargement des dossiers</span>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex items-center gap-4 rounded-md border border-border bg-surface px-6 py-4">
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3.5 w-40 animate-pulse rounded-sm bg-surface-2" />
            <span className="h-3 w-24 animate-pulse rounded-sm bg-surface-2" />
          </div>
          <span className="hidden h-3.5 w-32 animate-pulse rounded-sm bg-surface-2 sm:block" />
          <span className="h-5 w-20 animate-pulse rounded-sm bg-surface-2" />
          <span className="hidden h-8 w-20 animate-pulse rounded-sm bg-surface-2 lg:block" />
        </div>
      ))}
    </div>
  )
}

// Erreur : bandeau rouge pâle avec « Réessayer »
export function ListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-status-retard/40 bg-status-retard-bg px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-label text-status-retard">Impossible de récupérer les dossiers</span>
        <span className="text-caption text-secondary">Le logiciel comptable ne répond pas. Vos données ne sont pas perdues.</span>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry} className="self-start sm:self-auto">
        Réessayer
      </Button>
    </div>
  )
}

// Vide : aucun dossier pour la période (un groupe vide l'indique dans la liste elle-même)
export function ListEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface px-4 py-12 text-center">
      <span className="text-label text-primary">Aucun dossier pour cette période</span>
    </div>
  )
}

// Aucun résultat pour la recherche et / ou le filtre de statut : rappelle la cause et propose de tout réafficher
export function ListNoResult({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface px-4 py-12 text-center">
      <span className="text-label text-primary">
        {query ? `Aucun client ne correspond à « ${query} »` : 'Aucun client dans ce filtre'}
      </span>
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer rounded-sm text-label text-accent underline-offset-2 hover:underline"
      >
        Voir tous les clients
      </button>
    </div>
  )
}
