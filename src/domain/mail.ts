import { formatJourMois, formatPeriode } from './format'
import { piecesManquantes, toDateKey } from './status'
import type { Client, PieceAttendue } from './types'

// Mail de relance prêt à envoyer : le comptable peut encore modifier l'objet et le message
export interface MailRelance {
  destinataire: string // « Marc Peyrot <marc@garage-peyrot.fr> »
  objet: string
  message: string
}

// « de » élidé devant une voyelle : « d'octobre 2026 », « de novembre 2026 »
function de(mot: string) {
  return /^[aeiouyéèêàâîôû]/i.test(mot) ? `d'${mot}` : `de ${mot}`
}

type Signature = {
  // Collaborateur qui suit le client : c'est lui que le client connaît
  collaborateur: string
  cabinet: string
}

/*
  Rédige le mail de relance d'un client à partir de ses pièces manquantes.
  Le ton change si l'échéance est déjà passée (« au plus vite » au lieu de « avant le … »).
  « pieces » permet de reconstituer une relance passée : les pièces qui manquaient ce jour-là.
*/
export function composeRelance(
  client: Client,
  now: Date,
  { collaborateur, cabinet }: Signature,
  manquantes: PieceAttendue[] = piecesManquantes(client),
): MailRelance {
  const periode = formatPeriode(now)
  const prenom = client.contact.nom.split(' ')[0]
  const pluriel = manquantes.length > 1
  const echeance = formatJourMois(new Date(`${client.echeance}T00:00:00`))
  const depassee = client.echeance < toDateKey(now)

  const demande = depassee
    ? `L'échéance du ${echeance} est dépassée : pouvez-vous ${pluriel ? 'nous les' : 'nous la'} transmettre au plus vite ?`
    : `Pouvez-vous ${pluriel ? 'nous les' : 'nous la'} transmettre avant le ${echeance} ?`

  const message = [
    `Bonjour ${prenom},`,
    '',
    `Pour préparer votre déclaration de TVA ${de(periode)}, il nous manque encore ${
      pluriel ? `${manquantes.length} pièces` : 'une pièce'
    } :`,
    ...manquantes.map((p) => `- ${p.libelle}`),
    '',
    `${demande} Il suffit de répondre à ce mail avec ${pluriel ? 'les documents' : 'le document'} en pièce jointe.`,
    '',
    "Merci d'avance,",
    collaborateur,
    cabinet,
  ].join('\n')

  return {
    destinataire: `${client.contact.nom} <${client.contact.email}>`,
    objet: `Pièces manquantes · TVA ${periode}`,
    message,
  }
}
