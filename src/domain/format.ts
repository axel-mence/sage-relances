// Fonctions d'affichage (dates, durées, nombres) en français

// Jour de l'échéance TVA mensuelle affichée dans l'en-tête (hypothèse du cas fictif)
export const JOUR_ECHEANCE_TVA = 24

const moisAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const jourMois = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

// Les pièces suivies sont celles du mois précédent : « octobre 2026 » si on est en novembre
export function formatPeriode(now: Date): string {
  return moisAnnee.format(new Date(now.getFullYear(), now.getMonth() - 1, 1))
}

// Prochaine échéance TVA : le 24 du mois en cours, ou du mois suivant s'il est passé
export function prochaineEcheanceTva(now: Date): Date {
  const ceMois = new Date(now.getFullYear(), now.getMonth(), JOUR_ECHEANCE_TVA)
  return now.getDate() <= JOUR_ECHEANCE_TVA ? ceMois : new Date(now.getFullYear(), now.getMonth() + 1, JOUR_ECHEANCE_TVA)
}

export function formatJourMois(date: Date): string {
  return jourMois.format(date)
}

const jourMoisCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

// « 2026-11-18 » → « 18 nov. »
export function formatEcheance(isoDate: string): string {
  return jourMoisCourt.format(new Date(`${isoDate}T00:00:00`))
}

const HEURE_MS = 60 * 60 * 1000
const JOUR_MS = 24 * HEURE_MS

// Date de dernière relance en relatif : « À l'instant », « Il y a 3 h », « Hier », « Il y a 9 jours », « Jamais »
export function formatRelatif(isoDate: string | undefined, now: Date): string {
  if (!isoDate) return 'Jamais'
  const ecart = now.getTime() - new Date(isoDate).getTime()
  if (ecart < HEURE_MS) return "À l'instant"
  if (ecart < JOUR_MS) return `Il y a ${Math.floor(ecart / HEURE_MS)} h`
  const jours = Math.floor(ecart / JOUR_MS)
  return jours === 1 ? 'Hier' : `Il y a ${jours} jours`
}

// Résumé des pièces manquantes pour une ligne : « Relevé bancaire, Factures d'achat +1 »
export function resumePieces(libelles: string[], max = 2): string {
  // Le mois est déjà dans l'en-tête : on le retire pour gagner de la place
  const courts = libelles.map((l) => l.replace(/\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)$/i, ''))
  const reste = courts.length - max
  return courts.slice(0, max).join(', ') + (reste > 0 ? ` +${reste}` : '')
}

// 380 → « 6 h 20 », 45 → « 45 min », 120 → « 2 h »
export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}
