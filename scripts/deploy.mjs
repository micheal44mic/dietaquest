// Pubblica la build su GitHub Pages (branch gh-pages).
// Uso: npm run deploy
import { execSync } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const REMOTE = 'https://github.com/micheal44mic/dietaquest.git'
const SITE = 'https://micheal44mic.github.io/dietaquest/'

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' })

console.log('▸ build')
run('npm run build', process.cwd())

const work = mkdtempSync(join(tmpdir(), 'dietaquest-pages-'))
try {
  cpSync('dist', work, { recursive: true })
  // Senza .nojekyll, Pages ignora file e cartelle che iniziano con _
  writeFileSync(join(work, '.nojekyll'), '')

  console.log('▸ pubblicazione su gh-pages')
  run('git init -q', work)
  run('git checkout -q -b gh-pages', work)
  run('git add -A', work)
  run(`git commit -q -m "Deploy ${new Date().toISOString().slice(0, 16).replace('T', ' ')}"`, work)
  run(`git remote add origin ${REMOTE}`, work)
  run('git push -q --force origin gh-pages', work)

  console.log(`\n✓ online su ${SITE}`)
  console.log('  Su iPhone può volerci un minuto, e il service worker aggiorna al secondo avvio.')
} finally {
  rmSync(work, { recursive: true, force: true })
}
