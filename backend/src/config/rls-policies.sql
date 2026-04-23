-- ============================================================
-- SAFIE Tools — Políticas de Row Level Security (RLS)
-- Referência completa para validação manual no Supabase Dashboard
-- Execute após a migration 001_auth_security.sql
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- DELETE: apenas service role (não exposto ao cliente)

-- tool_sessions
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_sessions_select_own"
  ON tool_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tool_sessions_insert_own"
  ON tool_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tool_sessions_update_own"
  ON tool_sessions FOR UPDATE USING (auth.uid() = user_id);
-- DELETE: bloqueado (retenção para auditoria)

-- tools (catálogo público para usuários autenticados)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tools_select_authenticated"
  ON tools FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE: apenas service role

-- equity_invites
ALTER TABLE equity_invites ENABLE ROW LEVEL SECURITY;

-- Owner da sessão pode ler seus próprios convites
CREATE POLICY "equity_invites_select_session_owner"
  ON equity_invites FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM tool_sessions WHERE user_id = auth.uid()
    )
  );

-- Invitee pode ler pelo e-mail
CREATE POLICY "equity_invites_select_invitee"
  ON equity_invites FOR SELECT
  USING (
    invitee_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Apenas owner da sessão pode criar convites
CREATE POLICY "equity_invites_insert_owner"
  ON equity_invites FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM tool_sessions WHERE user_id = auth.uid()
    )
  );

-- Apenas o invitee pode marcar como usado
CREATE POLICY "equity_invites_update_invitee"
  ON equity_invites FOR UPDATE
  USING (
    invitee_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- equity_shared_results
ALTER TABLE equity_shared_results ENABLE ROW LEVEL SECURITY;

-- Leitura pública (token público — qualquer um com o token pode ver)
CREATE POLICY "equity_shared_results_select_public"
  ON equity_shared_results FOR SELECT USING (true);

-- Apenas owner da sessão pode criar resultado compartilhado
CREATE POLICY "equity_shared_results_insert_owner"
  ON equity_shared_results FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM tool_sessions WHERE user_id = auth.uid()
    )
  );

-- login_attempts: apenas service role (sem políticas de usuário)
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver e revogar as próprias sessões
CREATE POLICY "user_sessions_select_own"
  ON user_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_own"
  ON user_sessions FOR DELETE USING (auth.uid() = user_id);
-- INSERT/UPDATE: apenas service role
