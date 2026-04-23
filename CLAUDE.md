# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Desenvolvimento local (frontend na porta 3000, backend na porta 3001)
npm run dev

# Só frontend ou só backend
npm run dev:frontend
npm run dev:backend

# Build de produção (apenas frontend — o backend não precisa de build)
npm run build

# Lint do frontend
npm run lint --workspace=frontend

# Teste do backend
npm run test --workspace=backend
```

### Deploy

**Frontend:** automático a cada `git push origin main` via Vercel.

**Backend: NUNCA tem deploy automático.** Sempre rodar manualmente após qualquer alteração:
```bash
cd backend && npx vercel --prod
```

## Arquitetura

Monorepo npm workspaces com frontend e backend independentes, ambos deployados na Vercel.

### Frontend (`frontend/`)
React 18 + Vite + Tailwind CSS. SPA com React Router v6. Estado de autenticação global via `AuthProvider` em `src/hooks/useAuth.jsx`.

**Proxy local:** Vite redireciona `/api/*` para `http://localhost:3001` em dev. Em produção, o frontend chama `VITE_API_BASE_URL` diretamente.

**Cliente HTTP:** `src/services/api.js` — axios com interceptor que injeta JWT e faz refresh preventivo 5min antes do expiry. Em 401, faz signOut e redireciona para `/login`.

**Cliente Supabase:** `src/services/supabase.js` — PKCE flow, `detectSessionInUrl: true`, `persistSession: true`. O frontend conecta direto ao Supabase apenas para auth e leitura de perfil; todas as operações protegidas vão pelo backend.

**Inicialização de auth:** `useAuth.jsx` usa `supabase.auth.getSession()` como bootstrap (não depende só do listener). Timeout de 8s garante que `loading` nunca trava para sempre.

**Rotas protegidas:** `PrivateRoute` (exige login), `PublicOnlyRoute` (redireciona logado para /dashboard), `CompleteProfileRoute` (para usuários OAuth sem perfil). `OAuthGuard` em `App.jsx` detecta `needsProfileCompletion` e redireciona para `/completar-perfil`.

### Backend (`backend/`)
Express 5 + ESM. Serverless no Vercel via `backend/vercel.json`. Roda como servidor tradicional fora da Vercel (detecta `process.env.VERCEL !== '1'`).

**Inicialização:** `server.js` importa `validateEnv.js` antes de qualquer coisa — faz `process.exit(1)` se variáveis obrigatórias estiverem ausentes. `HUBSPOT_API_KEY` é opcional (apenas aviso).

**Autenticação:** toda request autenticada passa por `authMiddleware.js`, que valida o JWT via `supabaseAdmin.auth.getUser(token)` e anexa `req.user`.

**Supabase admin:** `config/supabase.js` usa `SUPABASE_SERVICE_ROLE_KEY` (nunca expor ao frontend).

**Segurança:** Helmet com CSP, HPP, CORS explícito (lista de origens em `server.js`), três níveis de rate limit em `utils/rateLimiter.js` (general/auth/tool), logger com scrub de PII em `utils/logger.js`.

### Banco de dados (Supabase)
Esquema em `backend/src/config/schema.sql`. Políticas RLS em `backend/src/config/rls-policies.sql`. Migração de segurança em `backend/src/config/migrations/001_auth_security.sql`.

Tabelas principais: `profiles`, `tool_sessions`, `login_attempts`, `user_sessions`.

Operações diretas do frontend: leitura de `profiles` (autenticado via anon key + RLS).
Operações via backend: tudo que envolve escrita protegida ou dados sensíveis.

### Ferramentas (arquitetura multi-step)
Cada ferramenta tem uma pasta em `frontend/src/pages/tools/<slug>/` com:
- `index.jsx` — orquestrador de steps
- `<Tool>Context.jsx` — estado compartilhado entre steps via React Context
- `Step*.jsx` — cada passo do formulário
- `QualificationModal.jsx` — coleta dados de lead antes de mostrar resultado
- `StepResults.jsx` — exibe o resultado

**Referência canônica:** `equity-calculator/` e `tax-better/` são os exemplos completos. Ferramentas simples (labor-risk, fast-due-diligence, litigation-cost, partners-cash) têm apenas um formulário + resultado.

Componentes de resultado reutilizáveis ficam em `frontend/src/components/tools/tax/` e `frontend/src/components/tools/equity/`.

Backend: cada ferramenta tem endpoint em `/api/tools/<slug>/session`. Validação via Zod em `backend/src/utils/validators.js`.

## Variáveis de ambiente

**Frontend** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Backend** (`backend/.env`):
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OAUTH_REDIRECT_URL=https://safie-tools.vercel.app/auth/callback
FRONTEND_URL=https://safie-tools.vercel.app
NODE_ENV=production
HUBSPOT_API_KEY=        # opcional
HUBSPOT_PORTAL_ID=      # opcional
```

## Design system

Tailwind com tokens customizados em `frontend/tailwind.config.js`:
- `primary: #154EFA` — botões e ações principais
- `secondary: #14DFFA` — hover, acentos, links
- `bg-dark / safie-dark: #07074B` — fundo escuro
- `bg-light / safie-light: #F5F7FD` — fundo claro
- Fonte: Inter em todas as variantes (`font-heading`, `font-body`, `font-cta`)

Componentes base: `Button`, `Card`, `Input`, `Modal`, `Slider` em `frontend/src/components/ui/`.

Responsividade padrão: `px-4 sm:px-6`, `text-2xl sm:text-3xl`, `flex-col sm:flex-row`.

## Convenções importantes

- Valores monetários: máscara BRL no input, `parseBRL()` de `src/utils/formatters.js` para enviar ao backend
- Imports dentro de `pages/tools/<slug>/`: usar `../../../` para chegar em `src/`
- Booleans em payloads Zod: sempre `true/false`, nunca `null` (usar `?? false`)
- Percentuais para o backend: sempre em decimal (`3% → 0.03`)
- HubSpot é acionado **apenas no cadastro** — dados das ferramentas ficam só no Supabase
