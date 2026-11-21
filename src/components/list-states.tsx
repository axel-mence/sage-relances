import { Button } from './button'

// États de la liste des clients (spec, section 8)

const SKELETON_ROWS = 6

// Chargement : 6 lignes grises qui pulsent, à la place des clients
export function ListSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col rounded-lg border border-border bg-surface">
      <span className="sr-only">Chargement des dossiers</span>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3.5 w-40 animate-pulse rounded-sm bg-page" />
            <span className="h-3 w-24 animate-pulse rounded-sm bg-page" />
          </div>
          <span className="hidden h-3.5 w-32 animate-pulse rounded-sm bg-page sm:block" />
          <span className="h-5 w-20 animate-pulse rounded-sm bg-page" />
          <span className="hidden h-8 w-20 animate-pulse rounded-md bg-page lg:block" />
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
      className="flex flex-col gap-3 rounded-lg border border-status-retard/30 bg-status-retard-bg p-4 sm:flex-row sm:items-center sm:justify-between"
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
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-12 text-center">
      <span className="text-label text-primary">Aucun dossier pour cette période</span>
    </div>
  )
}

// Recherche sans résultat : rappelle le texte cherché et propose d'effacer
export function ListNoResult({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-12 text-center">
      <span className="text-label text-primary">Aucun client ne correspond à « {query} »</span>
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer rounded-sm text-label text-accent-strong underline-offset-2 hover:underline"
      >
        Effacer la recherche
      </button>
    </div>
  )
}
