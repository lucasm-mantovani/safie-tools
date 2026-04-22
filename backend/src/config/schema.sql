-- ============================================================
-- SAFIE Tools — Schema do Banco de Dados (Supabase/PostgreSQL)
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  company_name        TEXT,
  business_segment    TEXT,
  hubspot_contact_id  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security — cada usuário só vê e edita o próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ler o próprio perfil"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuário pode atualizar o próprio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- Tabela de sessões de uso das ferramentas
CREATE TABLE IF NOT EXISTS tool_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_slug           TEXT NOT NULL,
  input_data          JSONB,
  output_data         JSONB,
  qualification_data  JSONB,
  hubspot_synced      BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS — cada usuário só vê as próprias sessões
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ler as próprias sessões"
  ON tool_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir próprias sessões"
  ON tool_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Tabela de ferramentas disponíveis na plataforma
CREATE TABLE IF NOT EXISTS tools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name_pt         TEXT NOT NULL,
  description_pt  TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  order_index     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Ferramentas são públicas (leitura sem autenticação)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ferramentas são públicas"
  ON tools FOR SELECT USING (true);


-- ============================================================
-- Seed — Ferramentas do portfólio SAFIE Tools
-- ============================================================

INSERT INTO tools (slug, name_pt, description_pt, is_active, order_index) VALUES
  (
    'equity-calculator',
    'Calculadora de Divisão de Participações Societárias',
    'Simule a divisão de cotas entre sócios com critérios objetivos baseados em contribuição, dedicação e risco.',
    TRUE, 1
  ),
  (
    'tax-regime-diagnostic',
    'Diagnóstico de Regime Tributário',
    'Descubra se sua empresa está no regime tributário mais vantajoso para o seu faturamento e setor.',
    TRUE, 2
  ),
  (
    'pj-risk-calculator',
    'Calculadora de Risco de Contratação PJ',
    'Avalie o risco de caracterização de vínculo empregatício nos seus contratos com prestadores PJ.',
    TRUE, 3
  ),
  (
    'due-diligence-checklist',
    'Gerador de Checklist de Due Diligence',
    'Gere um checklist personalizado para processos de captação, M&A ou venda de participação societária.',
    TRUE, 4
  ),
  (
    'litigation-cost-simulator',
    'Simulador de Custo de Litígio',
    'Estime os custos totais de um processo judicial antes de decidir entrar em litígio.',
    TRUE, 5
  ),
  (
    'prolabore-calculator',
    'Calculadora de Pró-labore Ideal',
    'Calcule o pró-labore ideal para maximizar sua remuneração líquida dentro do seu regime tributário.',
    TRUE, 6
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Equity Calculator — tabelas adicionais
-- ============================================================

CREATE TABLE IF NOT EXISTS equity_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES tool_sessions(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name  TEXT NOT NULL,
  partner_index INTEGER NOT NULL,
  token         TEXT UNIQUE NOT NULL,
  used          BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equity_shared_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES tool_sessions(id) ON DELETE CASCADE,
  public_token TEXT UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Política INSERT para profiles (caso ainda não exista)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Usuário pode inserir o próprio perfil'
  ) THEN
    EXECUTE 'CREATE POLICY "Usuário pode inserir o próprio perfil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END $$;
