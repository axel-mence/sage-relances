import { useState, type ReactNode } from 'react'
import { autoriserSage, connecterBoiteMail, marquerSageConnecte, seDeconnecter, type BoiteMail } from '../api/auth-api'
import { IconeCoche, LogoSage } from '../components/auth-ui'
import { Button } from '../components/button'
import { TabPanel, Tabs } from '../components/tabs'
import { Toasts } from '../components/toasts'
import { libelleRole, useSession } from '../hooks/use-session'
import { useToasts } from '../hooks/use-toasts'

type Onglet = 'compte' | 'logiciel' | 'mail'

// Autres logiciels comptables, grisés : seul Sage est proposé dans cette version
const AUTRES_LOGICIELS = ['Cegid', 'Pennylane', 'ACD']

const BOITES: { value: BoiteMail; nom: string; detail: string }[] = [
  { value: 'outlook', nom: 'Outlook', detail: 'Microsoft 365, Outlook.com' },
  { value: 'gmail', nom: 'Gmail', detail: 'Google Workspace, Gmail' },
]

/*
  Paramètres (référence Acctual « Settings » : onglets, puis une carte par connecteur).
  - Compte : infos saisies à l'inscription, déconnexion (utile sur mobile, sans barre latérale).
  - Logiciel comptable : Sage, les autres « Bientôt ».
  - Boîte mail : Outlook ou Gmail, une seule à la fois.
  Connecteurs fictifs pour l'instant : « Connecter » bascule seulement l'état enregistré dans le compte.
*/
export function Settings() {
  const compte = useSession()
  const [onglet, setOnglet] = useState<Onglet>('logiciel')
  const [enCours, setEnCours] = useState<string | null>(null)
  const { toasts, show, dismiss } = useToasts()

  if (!compte) return null

  async function basculerSage() {
    setEnCours('sage')
    if (!compte?.sage) await autoriserSage()
    marquerSageConnecte(!compte?.sage)
    setEnCours(null)
    show(compte?.sage ? 'Sage est déconnecté.' : 'Sage est connecté (simulation).')
  }

  async function basculerBoite(boite: BoiteMail) {
    setEnCours(boite)
    const deconnexion = compte?.boiteMail === boite
    await connecterBoiteMail(deconnexion ? null : boite)
    setEnCours(null)
    const nom = BOITES.find((b) => b.value === boite)?.nom
    show(deconnexion ? `${nom} est déconnecté.` : `${nom} est connecté (simulation).`)
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:px-8">
      <h1 className="font-display text-title">Paramètres</h1>

      <div className="flex max-w-3xl flex-col gap-6">
        <Tabs
          idPrefix="parametres"
          label="Sections des paramètres"
          items={[
            { value: 'compte', label: 'Compte' },
            { value: 'logiciel', label: 'Logiciel comptable' },
            { value: 'mail', label: 'Boîte mail' },
          ]}
          value={onglet}
          onChange={setOnglet}
        />

        <TabPanel idPrefix="parametres" value={onglet} className="flex flex-col gap-6">
          {onglet === 'compte' && (
            <Section titre="Votre compte" description="Informations saisies à l'inscription.">
              <dl className="flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
                <Ligne label="Nom" valeur={compte.nom || 'Non renseigné'} />
                <Ligne label="Email" valeur={compte.email} />
                <Ligne label="Cabinet" valeur={compte.cabinet || 'Non renseigné'} />
                <Ligne label="Rôle" valeur={libelleRole(compte)} />
              </dl>
              <Button variant="secondary" className="self-start" onClick={seDeconnecter}>
                Se déconnecter
              </Button>
            </Section>
          )}

          {onglet === 'logiciel' && (
            <Section titre="Logiciel comptable" description="Nudge y lit les pièces attendues et celles déjà reçues.">
              <div className="grid gap-3 sm:grid-cols-2">
                <Connecteur
                  logo={<LogoSage className="size-8 text-body" />}
                  nom="Sage"
                  detail="Sage 50, Sage 100, Génération Experts"
                  connecte={compte.sage}
                  enCours={enCours === 'sage'}
                  onClick={basculerSage}
                />
                {AUTRES_LOGICIELS.map((nom) => (
                  <ConnecteurBientot key={nom} nom={nom} />
                ))}
              </div>
            </Section>
          )}

          {onglet === 'mail' && (
            <Section titre="Boîte mail" description="Les relances partiront de votre adresse, et les réponses des clients y arriveront.">
              <div className="grid gap-3 sm:grid-cols-2">
                {BOITES.map((boite) => (
                  <Connecteur
                    key={boite.value}
                    logo={<LogoLettre lettre={boite.nom[0]} />}
                    nom={boite.nom}
                    detail={boite.detail}
                    connecte={compte.boiteMail === boite.value}
                    enCours={enCours === boite.value}
                    // Une seule boîte à la fois : l'autre est bloquée tant qu'une est connectée
                    disabled={compte.boiteMail !== null && compte.boiteMail !== boite.value}
                    onClick={() => basculerBoite(boite.value)}
                  />
                ))}
              </div>
              <p className="text-caption text-muted">Une seule boîte mail à la fois. Connexion simulée pour l'instant.</p>
            </Section>
          )}
        </TabPanel>
      </div>

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </main>
  )
}

function Section({ titre, description, children }: { titre: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-section">{titre}</h2>
        <p className="text-secondary">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-secondary">{label}</dt>
      <dd className="truncate text-primary">{valeur}</dd>
    </div>
  )
}

type ConnecteurProps = {
  logo: ReactNode
  nom: string
  detail: string
  connecte: boolean
  enCours: boolean
  disabled?: boolean
  onClick: () => void
}

// Carte d'un connecteur : logo, nom, détail, puis l'état (badge « Connecté ») et l'action
function Connecteur({ logo, nom, detail, connecte, enCours, disabled, onClick }: ConnecteurProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        {logo}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-label text-primary">{nom}</span>
          <span className="truncate text-caption text-secondary">{detail}</span>
        </div>
        {connecte && (
          <span className="flex items-center gap-1.5 rounded-xs bg-status-recue-bg px-2 py-1 text-caption text-status-recue">
            <IconeCoche className="size-3.5" />
            Connecté
          </span>
        )}
      </div>
      <Button
        size="sm"
        variant={connecte ? 'secondary' : 'primary'}
        loading={enCours}
        disabled={disabled}
        onClick={onClick}
        className="self-start"
      >
        {connecte ? 'Déconnecter' : 'Connecter'}
      </Button>
    </div>
  )
}

function ConnecteurBientot({ nom }: { nom: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-4 text-muted">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-xs bg-surface-2 font-display text-body">
        {nom[0]}
      </span>
      <span className="flex-1 text-label">{nom}</span>
      <span className="text-caption">Bientôt</span>
    </div>
  )
}

// Logo générique (pas les logos des marques) : une lettre sur une vignette
function LogoLettre({ lettre }: { lettre: string }) {
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-xs bg-surface-2 font-display text-body text-primary">
      {lettre}
    </span>
  )
}
