import type { Toast } from '../hooks/use-toasts'

type ToastsProps = {
  toasts: Toast[]
  onDismiss: (id: number) => void
}

const TONES = {
  // Toast « inversé » : fond clair sur l'app sombre (et l'inverse en mode clair)
  success: 'bg-inverse text-on-inverse',
  error: 'bg-status-retard text-on-inverse',
}

/*
  Zone des toasts, en bas de l'écran.
  Elle est toujours présente dans la page (même vide) pour que les lecteurs d'écran annoncent
  chaque nouveau message (aria-live).
*/
export function Toasts({ toasts, onDismiss }: ToastsProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-4 rounded-md px-4 py-3 text-body shadow-lg ${TONES[toast.tone]}`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fermer le message"
            className="cursor-pointer rounded-sm px-1 opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
