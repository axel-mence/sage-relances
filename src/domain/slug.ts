// Identifiant lisible d'un client dans l'adresse de sa fiche : « Garage Peyrot » → « garage-peyrot »
export function slugify(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // espaces, apostrophes, & … deviennent des tirets
    .replace(/^-+|-+$/g, '')
}
