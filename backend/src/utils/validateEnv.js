const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'HUBSPOT_API_KEY',
  'OAUTH_REDIRECT_URL',
  'NODE_ENV',
]

const missing = REQUIRED_VARS.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error('[validateEnv] Variáveis de ambiente obrigatórias ausentes:', missing.join(', '))
  process.exit(1)
}
