# SAFIE Tools — Plataforma de Ferramentas para Founders

> **URL de produção:** ferramentas.safie.com.br
> **Status:** Em desenvolvimento — Sprint 1 (Autenticação)
> **Última atualização:** 2026-04-20

---

## Visão Geral do Produto

O SAFIE Tools é uma plataforma web gratuita desenvolvida pela **SAFIE** — consultoria jurídica e contábil especializada em empresas de tecnologia. A plataforma oferece seis ferramentas práticas para founders e gestores tomarem decisões jurídicas e contábeis com mais segurança.

**Duplo propósito estratégico:**
1. **Entrega de valor imediata** — cada ferramenta resolve uma dor real do founder (divisão de participações, diagnóstico tributário, risco de PJ, due diligence, litígio, pró-labore)
2. **Geração de leads qualificados** — ao usar as ferramentas, o usuário revela informações sobre sua empresa que classificam automaticamente o seu nível de urgência comercial. Esses dados são enviados silenciosamente ao **HubSpot CRM** para follow-up pelo time de vendas da SAFIE

O usuário cria uma conta gratuita antes de acessar as ferramentas. Isso garante identificação completa do lead e permite personalização da experiência.

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIO (Browser)                        │
│              ferramentas.safie.com.br (Vercel)                  │
│                                                                  │
│  React 18 + Tailwind + React Router + React Hook Form           │
│  Recharts (gráficos) + jsPDF (exportação)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Railway/Render)                  │
│                   Node.js 20 + Express 5                        │
│                                                                  │
│  /api/auth      — registro de perfil                            │
│  /api/tools     — sessões e histórico                           │
│  /api/hubspot   — sincronização CRM (protegido, sem expor key)  │
└───────────┬──────────────────────────────┬──────────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐    ┌─────────────────────────────────┐
│   SUPABASE            │    │   HUBSPOT CRM                   │
│                       │    │                                 │
│  • Auth (JWT)         │    │  • Contatos com propriedades    │
│  • PostgreSQL         │    │    customizadas por ferramenta  │
│    - profiles         │    │  • Tags SQL para qualificação   │
│    - tool_sessions    │    │  • Integração via API v3        │
│    - tools            │    │                                 │
└───────────────────────┘    └─────────────────────────────────┘
```

### Fluxo de dados por ferramenta
1. Usuário preenche formulário da ferramenta no frontend
2. Frontend envia dados ao backend via `POST /api/tools/sessions`
3. Backend salva a sessão no Supabase (`tool_sessions`)
4. Backend avalia os dados de qualificação e envia ao HubSpot (`POST /api/hubspot/sync`)
5. HubSpot atualiza o contato com propriedades específicas da ferramenta e tags SQL
6. Frontend exibe o resultado para o usuário (sem bloquear em caso de falha no HubSpot)

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend framework | React | 18.x |
| Estilização | Tailwind CSS | 3.x |
| Roteamento | React Router | 6.x |
| Formulários | React Hook Form | 7.x |
| Gráficos | Recharts | 2.x |
| Exportação PDF | jsPDF + html2canvas | 2.x / 1.x |
| HTTP Client | Axios | 1.x |
| Backend framework | Express | 5.x |
| Runtime | Node.js | 20.x |
| Banco de dados | Supabase (PostgreSQL) | — |
| Autenticação | Supabase Auth | — |
| CRM | HubSpot API | v3 |
| Build tool | Vite | 5.x |
| Deploy frontend | Vercel | — |
| Deploy backend | Railway ou Render | — |

---

## Identidade Visual

| Elemento | Valor |
|---|---|
| Cor primária | `#154efa` (azul SAFIE) |
| Cor secundária | `#2414fa` (azul escuro) |
| Fundo claro | `#f5f7fd` |
| Fundo escuro / texto | `#0f0f29` |
| Fonte títulos | Esphimere (fallback: Playfair Display) |
| Fonte corpo | Telegraf (fallback: Inter) |
| Fonte CTAs | Inter |
| Estilo | Premium legal-tech / fintech — clean, moderno, espaçamento generoso. Sem estética de banco de imagens. |

**Regras de design:**
- Fundo de página: sempre `#f5f7fd` (nunca branco puro)
- Cards: fundo branco com sombra suave, bordas arredondadas (border-radius: 16px)
- Botões primários: fundo `#154efa`, texto branco, Inter Bold
- Heading sempre em Esphimere/Playfair Display
- Espaçamento mínimo entre seções: 80px
- Nunca usar fotos de stock. Usar ícones ou ilustrações geométricas.

---

## Ferramentas do Portfólio

### 1. Calculadora de Divisão de Participações Societárias
**Slug:** `equity-calculator`

**Objetivo:** Ajudar founders a chegar a uma divisão de cotas justa e objetiva, evitando conflitos futuros.

**Como funciona:**
- **Inputs:** número de sócios, status da empresa (aberta/em abertura), possui acordo de sócios, segmento, e para cada sócio: contribuição financeira, dedicação (horas), responsabilidade técnica, relacionamento comercial, rede de contatos
- **Lógica:** pontuação ponderada por critérios configuráveis com sliders; normalização para 100%
- **Output:** gráfico de pizza com percentual sugerido por sócio, tabela detalhada por critério, opção de exportar PDF

**Dados capturados para o HubSpot:**
- Status da empresa
- Possui acordo de sócios
- Segmento do negócio
- Número de sócios

**Propriedades HubSpot:**
`equity_company_status`, `equity_has_shareholders_agreement`, `equity_business_segment`, `equity_partners_count`, `equity_sql_tag`

**Gatilho comercial:** `equity_sql_tag = true` quando não há acordo de sócios → oferta de elaboração de Acordo de Sócios pela SAFIE

---

### 2. Diagnóstico de Regime Tributário
**Slug:** `tax-regime-diagnostic`

**Objetivo:** Identificar se a empresa está no regime tributário mais vantajoso e quando deve revisar.

**Como funciona:**
- **Inputs:** faixa de faturamento anual, regime atual, data da última revisão tributária, tipo de atividade (serviços/produtos), margem de lucro estimada
- **Lógica:** matriz de recomendação baseada em combinação de faturamento × regime × margem; classificação em "Otimizado", "Atenção" ou "Revisão Urgente"
- **Output:** diagnóstico visual com semáforo (verde/amarelo/vermelho), recomendação de regime ideal, estimativa de economia potencial, exportar PDF

**Dados capturados para o HubSpot:**
- Faixa de faturamento anual
- Regime tributário atual
- Última revisão tributária

**Propriedades HubSpot:**
`tax_annual_revenue_range`, `tax_current_regime`, `tax_last_reviewed`, `tax_sql_tag`

**Gatilho comercial:** `tax_sql_tag = true` quando faturamento > R$500k e última revisão há mais de 1 ano ou nunca → oferta de Planejamento Tributário

---

### 3. Calculadora de Risco de Contratação PJ
**Slug:** `pj-risk-calculator`

**Objetivo:** Avaliar o risco jurídico-trabalhista dos contratos com prestadores PJ.

**Como funciona:**
- **Inputs:** número total de prestadores PJ, para cada prestador: exclusividade, subordinação hierárquica, habitualidade, controle de horário, fornecimento de equipamentos
- **Lógica:** score de risco por prestador baseado em indicadores de vínculo empregatício conforme CLT; classificação em Baixo/Médio/Alto risco
- **Output:** lista de prestadores por nível de risco, score geral de exposição, alertas sobre prestadores de alto risco, recomendações por caso, exportar PDF

**Dados capturados para o HubSpot:**
- Total de prestadores
- Número de prestadores de alto risco
- Já sofreu processo trabalhista

**Propriedades HubSpot:**
`pj_contractors_count`, `pj_high_risk_count`, `pj_has_had_lawsuit`, `pj_sql_tag`

**Gatilho comercial:** `pj_sql_tag = true` quando 2 ou mais prestadores de alto risco → oferta de Auditoria de Contratos PJ

---

### 4. Gerador de Checklist de Due Diligence
**Slug:** `due-diligence-checklist`

**Objetivo:** Gerar um checklist personalizado para processos de captação, M&A ou venda de participação.

**Como funciona:**
- **Inputs:** tipo de operação (captação/M&A/venda de participação), prazo estimado da operação, possui assessor jurídico, porte da empresa (faturamento), estrutura societária atual
- **Lógica:** seleção dinâmica de itens de checklist a partir de biblioteca de 100+ itens categorizados por área (societário, fiscal, trabalhista, IP, compliance, contratos); ponderação por urgência e tipo de operação
- **Output:** checklist organizado por área com status (pendente/concluído/não aplicável), estimativa de prazo por categoria, exportar PDF

**Dados capturados para o HubSpot:**
- Tipo de operação
- Prazo da operação
- Possui assessor jurídico

**Propriedades HubSpot:**
`dd_operation_type`, `dd_timeline_months`, `dd_has_legal_advisor`, `dd_sql_tag`

**Gatilho comercial:** `dd_sql_tag = true` quando operação em até 6 meses e sem assessor jurídico → oferta de Assessoria em M&A

---

### 5. Simulador de Custo de Litígio
**Slug:** `litigation-cost-simulator`

**Objetivo:** Estimar o custo real de um processo judicial para embasar a decisão de litigar ou negociar.

**Como funciona:**
- **Inputs:** tipo de conflito (trabalhista/cível/societário/fiscal), valor em disputa, possui advogado, instância atual ou estimada, tempo estimado do processo, probabilidade de êxito (slider)
- **Lógica:** cálculo de custas processuais estimadas por tipo e instância, honorários advocatícios (tabela OAB), custo de oportunidade, risco de condenação ponderado pela probabilidade de êxito
- **Output:** breakdown de custos (custas + honorários + risco de condenação + custo de oportunidade), comparativo litigar vs. acordar, recomendação estratégica, exportar PDF

**Dados capturados para o HubSpot:**
- Tipo de conflito
- Valor em disputa
- Possui advogado

**Propriedades HubSpot:**
`litigation_conflict_type`, `litigation_dispute_value`, `litigation_has_lawyer`, `litigation_sql_tag`

**Gatilho comercial:** `litigation_sql_tag = true` quando disputa acima de R$50k e sem advogado → oferta de Representação Judicial

---

### 6. Calculadora de Pró-labore Ideal
**Slug:** `prolabore-calculator`

**Objetivo:** Calcular o valor de pró-labore que maximiza a remuneração líquida do sócio dentro do regime tributário da empresa.

**Como funciona:**
- **Inputs:** faturamento mensal da empresa, regime tributário, número de sócios que recebem pró-labore, outros rendimentos do sócio (aluguel, dividendos), possui contador ativo
- **Lógica:** simulação de INSS sobre pró-labore × redução de base de cálculo × distribuição de lucros isentos; cálculo do mix otimizado pró-labore + dividendos para minimizar INSS e IR
- **Output:** comparativo de cenários (pró-labore atual vs. otimizado), gráfico de remuneração líquida por faixa, economia mensal e anual estimada, exportar PDF

**Dados capturados para o HubSpot:**
- Faturamento mensal
- Regime tributário
- Possui contador ativo

**Propriedades HubSpot:**
`prolabore_monthly_revenue`, `prolabore_current_regime`, `prolabore_has_accountant`, `prolabore_sql_tag`

**Gatilho comercial:** `prolabore_sql_tag = true` quando não possui contador ativo → oferta de Contabilidade SAFIE

---

## Estrutura de Agentes de Desenvolvimento

Este projeto usa um workflow multi-agente para desenvolvimento eficiente. Cada agente tem um papel específico.

---

### Agente 1 — Arquiteto de Sistema (este README)
**Responsável por:** estrutura do projeto, schema do banco, contratos de API, decisões arquiteturais, documentação técnica.

**Quando acionar:** início de cada nova ferramenta, decisão estrutural relevante, alteração no schema ou nas integrações.

**Prompt base:**
```
You are the Lead Architect of SAFIE Tools. Read the README.md at the project root carefully.
Your task is: [descreva a tarefa arquitetural].
Update the README.md if any architectural decision changes, and document the new API contracts or schema changes before the other agents start implementing.
```

---

### Agente 2 — Desenvolvedor Backend
**Responsável por:** rotas Express, controllers, integração Supabase, integração HubSpot, autenticação JWT.

**Quando acionar:** após o Agente 1 definir os contratos de API para cada ferramenta.

**Prompt de acionamento:**
```
You are a senior Node.js backend developer. Read the README.md at the project root carefully.
Your task is: [tarefa específica, ex: "implement the equity-calculator backend route and HubSpot sync"].
Follow all existing patterns in backend/src/, naming conventions and integration specs documented in the README.
Use async/await, try/catch for all errors, and never expose API keys.
When done, document the new endpoints in the README under the relevant tool section.
```

---

### Agente 3 — Desenvolvedor Frontend
**Responsável por:** componentes React, páginas, formulários, gráficos Recharts, exportação PDF, design system.

**Quando acionar:** após o Agente 2 entregar e documentar as rotas da API para cada ferramenta.

**Prompt de acionamento:**
```
You are a senior React frontend developer. Read the README.md at the project root carefully.
Your task is: [tarefa específica, ex: "build the equity-calculator page and form"].
Follow the SAFIE brand design system (colors, fonts, spacing) documented in the README.
Use the existing UI components in frontend/src/components/ui/.
Use the api.js service for all backend calls — never call HubSpot directly from the frontend.
Use async/await and React Hook Form for all forms.
```

---

### Agente 4 — Engenheiro de Qualidade
**Responsável por:** revisão de código, bugs, segurança, performance, consistência com padrões do projeto.

**Quando acionar:** após cada entrega do Agente 2 ou Agente 3, antes de avançar para integração.

**Prompt de acionamento:**
```
You are a senior QA engineer and code reviewer. Read the README.md at the project root carefully.
Review the following code for: bugs, security vulnerabilities (XSS, injection, key exposure), performance issues, and inconsistencies with the project standards documented in the README.

[colar código a revisar]

Return a prioritized list of issues (CRÍTICO / ALTO / MÉDIO / BAIXO) with specific line references and suggested fixes.
```

---

### Agente 5 — Engenheiro de Integração
**Responsável por:** conectar frontend e backend, validar fluxo ponta a ponta até o HubSpot, testar autenticação.

**Quando acionar:** após Agentes 2 e 3 entregarem uma ferramenta completa.

**Prompt de acionamento:**
```
You are a senior integration engineer. Read the README.md at the project root carefully.
Your task is to validate and fix the end-to-end integration for [nome da ferramenta]:
  frontend form → POST /api/tools/sessions → Supabase → POST /api/hubspot/sync → HubSpot CRM.

Check: authentication flow, data shape consistency between frontend and backend, HubSpot property mapping (see hubspot-properties.md), error handling on each layer.
Document any issues found and fix them. Confirm when the full flow is working.
```

---

## Ordem de Desenvolvimento (Sprints)

| Sprint | Tarefa | Agentes envolvidos |
|---|---|---|
| **Sprint 1** | Autenticação completa: Supabase Auth, perfil, envio HubSpot | Agente 2 → Agente 3 → Agente 5 |
| **Sprint 2** | Home, Dashboard e navegação base | Agente 3 |
| **Sprint 3** | Calculadora de Divisão de Participações (ferramenta 1 completa) | Agente 2 → Agente 3 → Agente 4 → Agente 5 |
| **Sprint 4** | Diagnóstico de Regime Tributário (ferramenta 2) | Agente 2 → Agente 3 → Agente 4 → Agente 5 |
| **Sprint 5** | Calculadora de Risco PJ (ferramenta 3) | Agente 2 → Agente 3 → Agente 4 → Agente 5 |
| **Sprint 6** | Gerador de Checklist de Due Diligence (ferramenta 4) | Agente 2 → Agente 3 → Agente 4 → Agente 5 |
| **Sprint 7** | Simulador de Custo de Litígio (ferramenta 5) | Agente 2 → Agente 3 → Agente 4 → Agente 5 |
| **Sprint 8** | Calculadora de Pró-labore Ideal (ferramenta 6) | Agente 2 → Agente 3 → Agente 4 → Agente 5 |
| **Sprint 9** | QA geral, performance, SEO, acessibilidade | Agente 4 |
| **Sprint 10** | Deploy, configuração de domínio, variáveis de produção | — |

---

## Convenções de Código

| Regra | Padrão |
|---|---|
| Variáveis, funções, arquivos | **inglês** |
| Texto de interface e comentários | **português brasileiro** |
| Componentes React | `PascalCase.jsx` |
| Hooks | `useNomeDoHook.js` |
| Serviços e utilitários | `camelCase.js` |
| Rotas e controllers | `camelCase.js` |
| Constantes | `UPPER_SNAKE_CASE` |
| Assíncrono | sempre `async/await`, nunca `.then()` |
| Erros | sempre `try/catch` com mensagem em português |
| Chaves de API | **nunca** no frontend — apenas no backend via variável de ambiente |
| Componentes UI | reutilizar os existentes em `frontend/src/components/ui/` |
| Chamadas de API | sempre via `api.js` (axios com interceptors de auth) |

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 20+
- npm 10+
- Conta no Supabase (gratuita)
- Conta no HubSpot (gratuita)

### 1. Clonar e instalar dependências
```bash
git clone <repo-url>
cd safie-tools
npm install
```

### 2. Configurar variáveis de ambiente

**Frontend** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

**Backend** (`backend/.env`):
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
HUBSPOT_API_KEY=sua_private_app_token
HUBSPOT_PORTAL_ID=seu_portal_id
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar banco de dados no Supabase
1. Acesse o **SQL Editor** no dashboard do Supabase
2. Execute o conteúdo de `backend/src/config/schema.sql`
3. Ative a autenticação por e-mail/senha em Authentication → Providers

### 4. Configurar propriedades customizadas no HubSpot
1. Acesse Configurações → Propriedades → Contatos
2. Crie cada propriedade listada em `backend/src/config/hubspot-properties.md`

### 5. Iniciar o projeto
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

---

## Contratos de API

### Sprint 1 — Autenticação (IMPLEMENTADO)

#### POST /api/auth/register
Cria o perfil do usuário após o signUp do Supabase e dispara criação no HubSpot de forma assíncrona.
Idempotente: se chamado duas vezes para o mesmo `user_id`, retorna o perfil existente sem erro.
```json
// Request Body
{
  "user_id": "uuid",          // obrigatório — vem de supabase.auth.currentUser.id
  "full_name": "string",      // obrigatório
  "email": "string",          // obrigatório
  "phone": "string",          // opcional
  "company_name": "string",   // opcional
  "business_segment": "string" // opcional
}
// Response 201 (novo perfil criado)
{ "profile": { ...profileData }, "created": true }
// Response 200 (perfil já existia — chamada idempotente)
{ "profile": { ...profileData }, "created": false }
```

#### GET /api/auth/profile/check *(autenticado)*
Verifica se o perfil existe. Usado no fluxo OAuth para detectar novos usuários.
Nunca retorna 404 — retorna `exists: false` se não houver perfil.
```json
// Response 200
{ "exists": true, "profile": { "id": "...", "full_name": "...", "email": "...", "company_name": "..." } }
// ou
{ "exists": false }
```

#### GET /api/auth/profile *(autenticado)*
```json
// Response 200
{ "profile": { "id": "...", "full_name": "...", "email": "...", "phone": "...", "company_name": "...", "business_segment": "...", "hubspot_contact_id": "...", "created_at": "..." } }
```

#### PATCH /api/auth/profile *(autenticado)*
Atualiza campos do perfil. Ao menos um campo deve ser enviado.
Se o usuário já tiver `hubspot_contact_id`, atualiza também o contato no HubSpot de forma assíncrona.
```json
// Request Body (todos opcionais, mas pelo menos um obrigatório)
{ "full_name": "string?", "phone": "string?", "company_name": "string?", "business_segment": "string?" }
// Response 200
{ "profile": { ...profileData } }
```

---

### Fluxo de Autenticação — Email/Senha

```
Frontend                          Backend                    Supabase            HubSpot
   │                                  │                          │                  │
   │── supabase.auth.signUp() ────────────────────────────────> │                  │
   │<─ { user: { id, email } } ───────────────────────────────  │                  │
   │                                  │                          │                  │
   │── POST /api/auth/register ──────>│                          │                  │
   │   { user_id, full_name,          │── INSERT profiles ──────>│                  │
   │     email, phone, ... }          │<─ profile ───────────────│                  │
   │<─ { profile, created: true } ────│                          │                  │
   │                                  │── createContact() ──────────────────────── >│ (async)
   │                                  │── UPDATE hubspot_contact_id ─────────────── │
```

### Fluxo de Autenticação — Google OAuth

```
Frontend                          Backend                    Supabase            HubSpot
   │                                  │                          │                  │
   │── supabase.auth.signInWithOAuth('google') ───────────────> │                  │
   │<─ redirect para Google ──────────────────────────────────  │                  │
   │   (usuário autentica no Google)                            │                  │
   │<─ redirect de volta ao app com token ─────────────────── > │                  │
   │                                  │                          │                  │
   │── GET /api/auth/profile/check ──>│                          │                  │
   │   Authorization: Bearer {token}  │── SELECT profiles ──────>│                  │
   │<─ { exists: false } ─────────────│                          │                  │
   │                                  │                          │                  │
   │  [Frontend mostra formulário de perfil]                     │                  │
   │                                  │                          │                  │
   │── POST /api/auth/register ──────>│                          │                  │
   │   { user_id, full_name, ... }    │── INSERT profiles ──────>│                  │
   │<─ { profile, created: true } ────│── createContact() ──────────────────────── >│ (async)
```

---

### GET /api/tools
```json
// Response 200
{ "tools": [{ "slug": "equity-calculator", "name_pt": "...", "is_active": true, "order_index": 1 }] }
```

### POST /api/tools/sessions *(autenticado)*
```json
// Request
{ "tool_slug": "equity-calculator", "input_data": {}, "output_data": {}, "qualification_data": {} }
// Response 201
{ "session": { "id": "uuid", ...sessionData } }
```

### POST /api/hubspot/sync *(autenticado)*
```json
// Request
{ "toolSlug": "equity-calculator", "qualificationData": { "equity_company_status": "aberta", "equity_sql_tag": "true" } }
// Response 200 — contato sincronizado
{ "success": true, "synced": true }
// Response 200 — contato ainda não vinculado (não é erro)
{ "success": true, "synced": false }
```

---

## Como Acionar Cada Agente

### Para iniciar o Sprint 1 (Autenticação):
```
You are a senior Node.js backend developer. Read the README.md at the project root.
Your task is Sprint 1: implement complete authentication using Supabase Auth.
This includes:
- POST /api/auth/register: receive user_id + profile data from frontend after Supabase signUp, create record in profiles table, silently create HubSpot contact using hubspotService
- GET /api/auth/profile: return authenticated user's profile
- PATCH /api/auth/profile: update profile fields
- JWT middleware in authMiddleware.js: validate Supabase JWT, attach user to req.user
Follow all conventions documented in the README. The backend structure is already in place — fill in the implementation.
Start with authMiddleware, then authController, then confirm when done so the Frontend Agent can build the auth UI.
```

### Para cada nova ferramenta (após Sprint 1):
```
You are a senior Node.js backend developer. Read the README.md at the project root.
Your task is to implement the backend for [nome da ferramenta] (slug: [slug]).
Create:
1. The qualification logic: evaluate input_data and compute qualification_data + SQL tags as documented in the README under that tool's section
2. Update hubspotService if needed to handle the new properties
3. The route is already declared in tools.js — implement saveSession to also trigger HubSpot sync for this tool
Document the new behavior in the README when done.
```

### Para revisar código:
```
You are a senior QA engineer. Read the README.md at the project root.
Review the following code for bugs, security issues, and inconsistencies with project standards:

[colar código]

Return issues as: CRÍTICO / ALTO / MÉDIO / BAIXO with line references and suggested fixes.
```
