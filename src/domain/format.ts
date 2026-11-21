// Fonctions d'affichage (dates, durées, nombres) en français

// Jour de l'échéance TVA mensuelle affichée dans l'en-tête (hypothèse du cas fictif)
export const JOUR_ECHEANCE_TVA = 24

const moisAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const jourMois = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

// « de » élidé devant une voyelle : « d'octobre 2026 », « de novembre 2026 »
export function de(mot: string): string {
  return /^[aeiouyéèêàâîôû]/i.test(mot) ? `d'${mot}` : `de ${mot}`
}

// Les pièces suivies sont celles du mois précédent : « octobre 2026 » si on est en novembre
export function formatPeriode(now: Date): string {
  return moisAnnee.format(new Date(now.getFullYear(), now.getMonth() - 1, 1))
}

// Prochaine échéance TVA : le 24 du mois en cours, ou du mois suivant s'il est passé
export function prochaineEcheanceTva(now: Date): Date {
  const ceMois = new Date(now.getFullYear(), now.getMonth(), JOUR_ECHEANCE_TVA)
  return now.getDate() <= JOUR_ECHEANCE_TVA ? ceMois : new Date(now.getFullYear(), now.getMonth() + 1, JOUR_ECHEANCE_TVA)
}

// « 18 novembre », et « 1er novembre » pour le premier du mois (règle typographique française)
export function formatJourMois(date: Date): string {
  return jourMois.format(date).replace(/^1 /, '1er ')
}

const jourMoisCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

// « 2026-11-18 » → « 18 nov. »
export function formatEcheance(isoDate: string): string {
  return jourMoisCourt.format(new Date(`${isoDate}T00:00:00`))
}

const dateHeure = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Date et heure d'une relance : « 19 nov. à 10:00 »
export function formatDateHeure(iso: string): string {
  return dateHeure.format(new Date(iso)).replace(',', ' à')
}

// Échéance en clair pour la fiche client : « dépassée de 2 jours », « aujourd'hui », « dans 3 jours »
export function formatEcheanceRelative(isoDate: string, now: Date): string {
  const echeance = new Date(`${isoDate}T00:00:00`)
  const aujourdhui = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const jours = Math.round((echeance.getTime() - aujourdhui.getTime()) / (24 * 60 * 60 * 1000))
  const pluriel = (n: number) => `${n} jour${n > 1 ? 's' : ''}`
  if (jours === 0) return "aujourd'hui"
  return jours < 0 ? `dépassée de ${pluriel(-jours)}` : `dans ${pluriel(jours)}`
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

// « Relevé bancaire octobre » → « Relevé bancaire » : quand le mois est déjà affiché au-dessus
export function sansMois(libelle: string): string {
  return libelle.replace(/\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)$/i, '')
}

// Résumé des pièces manquantes pour une ligne : « Relevé bancaire, Factures d'achat +1 »
export function resumePieces(libelles: string[], max = 2): string {
  // Le mois est déjà dans l'en-tête : on le retire pour gagner de la place
  const courts = libelles.map(sansMois)
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
