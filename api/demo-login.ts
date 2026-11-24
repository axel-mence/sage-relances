import { timingSafeEqual } from 'node:crypto'

/*
  Fonction serveur (Vercel Function) : connexion au compte démo.
  - Elle tourne chez Vercel, jamais dans le navigateur : les identifiants démo
    restent dans les variables d'environnement DEMO_EMAIL et DEMO_PASSWORD
    (réglages du projet Vercel, ou .env.local en local), jamais dans le code.
  - Elle vérifie l'email et le mot de passe, puis renvoie le profil du compte démo
    (cabinet fictif). Les données clients, elles, viennent déjà de src/data/clients.json.
  - En local, vite.config.ts branche la même fonction sur le serveur de dev.
*/

export type ProfilDemo = {
  email: string
  nom: string
  cabinet: string
  dossiers: string
  role: 'associe'
}

type Env = { DEMO_EMAIL?: string; DEMO_PASSWORD?: string }

// Comparaison en temps constant : la durée de réponse ne trahit pas les caractères justes
function egal(a: string, b: string) {
  const octetsA = Buffer.from(a)
  const octetsB = Buffer.from(b)
  return octetsA.length === octetsB.length && timingSafeEqual(octetsA, octetsB)
}

/*
  Logique pure, partagée entre Vercel et le serveur de dev.
  Renvoie le profil si les identifiants sont bons, null sinon,
  et 'non-configure' si les variables d'environnement manquent.
*/
export function verifierIdentifiantsDemo(email: string, motDePasse: string, env: Env): ProfilDemo | null | 'non-configure' {
  const emailDemo = env.DEMO_EMAIL?.trim().toLowerCase()
  const motDePasseDemo = env.DEMO_PASSWORD
  if (!emailDemo || !motDePasseDemo) return 'non-configure'

  const emailOk = egal(email.trim().toLowerCase(), emailDemo)
  const motDePasseOk = egal(motDePasse, motDePasseDemo)
  if (!emailOk || !motDePasseOk) return null

  return {
    email: emailDemo,
    nom: 'Claire Lemoine',
    cabinet: 'Cabinet Lemoine',
    dossiers: '200 à 500',
    role: 'associe',
  }
}

// Réponse JSON commune
function json(corps: unknown, status: number) {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

// Lit le corps de la requête et applique la vérification (utilisé par Vercel et par le dev)
export async function repondre(request: Request, env: Env): Promise<Response> {
  let email = ''
  let motDePasse = ''
  try {
    const corps = (await request.json()) as { email?: unknown; motDePasse?: unknown }
    email = typeof corps.email === 'string' ? corps.email : ''
    motDePasse = typeof corps.motDePasse === 'string' ? corps.motDePasse : ''
  } catch {
    return json({ erreur: 'Requête invalide.' }, 400)
  }

  const resultat = verifierIdentifiantsDemo(email, motDePasse, env)
  if (resultat === 'non-configure') return json({ erreur: 'Compte démo non configuré.' }, 503)
  if (!resultat) return json({ erreur: 'Identifiants incorrects.' }, 401)
  return json({ profil: resultat }, 200)
}

// Point d'entrée Vercel : POST /api/demo-login
export function POST(request: Request) {
  return repondre(request, process.env)
}
