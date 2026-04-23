const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OAUTH_REDIRECT_URL',
  'NODE_ENV',
]

// Variáveis opcionais — apenas aviso, não bloqueia o servidor
const OPTIONAL_VARS = ['HUBSPOT_API_KEY', 'HUBSPOT_PORTAL_ID']
const missingOptional = OPTIONAL_VARS.filter((key) => !process.env[key])
if (missingOptional.length > 0) {
  console.warn('[validateEnv] Variáveis opcionais ausentes (funcionalidade reduzida):', missingOptional.join(', '))
}

const missing = REQUIRED_VARS.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error('[validateEnv] Variáveis de ambiente obrigatórias ausentes:', missing.join(', '))
  process.exit(1)
}
