import type { Contact } from '../domain/types'

/*
  « Lui écrire » : ouvre un nouveau mail dans Outlook (version web, Microsoft 365), destinataire déjà rempli.
  Nouvel onglet pour ne pas quitter l'outil. Pour un mail libre, hors relance (une question, un rendez-vous…).
  Lien stylé comme le bouton secondaire du DS.
*/
export function WriteEmailLink({ contact }: { contact: Contact }) {
  return (
    <a
      href={`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(contact.email)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Écrire à ${contact.nom} dans Outlook (nouvel onglet)`}
      className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-3 text-button whitespace-nowrap text-primary transition-colors hover:bg-surface-2"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
        <path
          d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5ZM2.5 4.5 8 8.5l5.5-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Lui écrire
    </a>
  )
}
