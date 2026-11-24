import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { repondre } from './api/demo-login.ts'

/*
  En local, le serveur de dev ne lance pas les fonctions Vercel du dossier api/.
  Ce petit plugin branche la même fonction sur /api/demo-login, avec les
  variables lues dans .env.local (jamais commité).
*/
function connexionDemoEnLocal(): Plugin {
  return {
    name: 'connexion-demo-en-local',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), 'DEMO_')
      server.middlewares.use('/api/demo-login', async (req, res) => {
        // Corps de la requête Node, transformé en Request standard
        const morceaux: Buffer[] = []
        for await (const morceau of req) morceaux.push(morceau as Buffer)
        const request = new Request('http://localhost/api/demo-login', {
          method: req.method,
          headers: { 'content-type': 'application/json' },
          body: req.method === 'POST' ? Buffer.concat(morceaux) : undefined,
        })
        const reponse = await repondre(request, env)
        res.statusCode = reponse.status
        res.setHeader('content-type', 'application/json')
        res.end(await reponse.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), connexionDemoEnLocal()],
})
