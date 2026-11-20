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

// 380 → « 6 h 20 », 45 → « 45 min », 120 → « 2 h »
export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}
