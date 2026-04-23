-- ============================================================
-- Migration 001 — Segurança e Autenticação
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Novas colunas na tabela profiles (ALTER, não recria)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 500),
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_product_updates":true,"email_tool_results":true,"email_commercial":false}',
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active','suspended','deleted')),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Tabela de tentativas de login (rate limit por e-mail e auditoria)
CREATE TABLE IF NOT EXISTS login_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  success     BOOLEAN,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created
  ON login_attempts(email, created_at);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Tabela de sessões ativas (fingerprinting e revogação)
CREATE TABLE IF NOT EXISTS user_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  refresh_token_hash TEXT,
  user_agent_hash   TEXT,
  ip_address        TEXT,
  last_active       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
