# SECURITY.md — Checklist de Segurança para Lançamento

**Instrução**: Marque cada item como `[x]` somente após validação manual em ambiente de produção.

---

## AUTENTICAÇÃO

- [ ] Fluxo Google OAuth testado de ponta a ponta em produção
- [ ] Registro com e-mail/senha envia e-mail de confirmação
- [ ] E-mails não confirmados não conseguem fazer login
- [ ] Fluxo de recuperação de senha testado de ponta a ponta
- [ ] Rate limiting nas rotas de auth verificado (10 req/15min por IP)
- [ ] Tentativas de login malsucedidas são registradas na tabela `login_attempts`
- [ ] Bloqueio após 5 tentativas falhas verificado (lockout de 15 min)
- [ ] Logout invalida sessão no servidor (não apenas client-side)
- [ ] "Encerrar todas as sessões" testado com dois navegadores simultâneos

## GESTÃO DE SESSÕES

- [ ] Access tokens expiram em 1 hora
- [ ] Refresh tokens expiram em 7 dias
- [ ] Refresh token expirado redireciona para /login com mensagem
- [ ] Refresh de token acontece de forma transparente antes do vencimento
- [ ] Lista de sessões ativas mostra dados precisos
- [ ] Revogação de sessão individual funciona
- [ ] Troca de senha invalida todas as outras sessões

## PERFIL DE USUÁRIO

- [ ] Upload de avatar valida tipo de arquivo por magic bytes
- [ ] Upload de avatar rejeita arquivos > 5MB
- [ ] Atualização de perfil sincroniza com HubSpot
- [ ] Alteração de e-mail requer confirmação do novo e-mail
- [ ] Troca de senha exige a senha atual
- [ ] Exclusão de conta anonimiza PII
- [ ] Exportação de dados gera JSON completo

## SEGURANÇA DE TRANSPORTE

- [ ] HTTPS obrigatório em produção (verificar via SSL Labs — meta: nota A+)
- [ ] Header HSTS presente com preload
- [ ] Todas as chamadas de API usam HTTPS
- [ ] Nenhum aviso de mixed content no navegador

## HEADERS HTTP (verificar via securityheaders.com — meta: nota A)

- [ ] Content-Security-Policy presente e restritivo
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Strict-Transport-Security presente

## VALIDAÇÃO DE ENTRADAS

- [ ] Todos os campos de texto sanitizados no servidor
- [ ] Upload de arquivo valida magic bytes (não apenas extensão)
- [ ] Tamanho máximo de body JSON: 1MB
- [ ] Nenhum SQL construído com concatenação de strings
- [ ] Nenhum `dangerouslySetInnerHTML` sem sanitização no React

## RATE LIMITING

- [ ] Limiter geral verificado (100 req/15min por IP)
- [ ] Limiter de auth verificado (10 req/15min por IP)
- [ ] Limiter de ferramentas verificado (20 req/hora por usuário)

## TRATAMENTO DE ERROS

- [ ] Erros em produção retornam mensagens genéricas apenas
- [ ] Nenhum stack trace exposto em produção
- [ ] Nenhuma mensagem de erro do banco de dados exposta
- [ ] Nenhum path interno ou versão de dependência exposta

## DADOS SENSÍVEIS

- [ ] Nenhuma senha registrada em log em nenhum serviço
- [ ] Nenhum token registrado em log (verificar `logger.js`)
- [ ] Nenhum dado PII nos logs do servidor
- [ ] Arquivos `.env` não commitados (verificar `.gitignore`)
- [ ] Nenhuma chave de API no bundle do frontend (verificar com `npm run build` e inspecionar dist/)

## DEPENDÊNCIAS

- [x] `npm audit` no backend — 0 vulnerabilidades
- [ ] `npm audit` no frontend — **3 moderate + 1 critical pendentes** (ver abaixo)
- [ ] Todas as dependências com versões fixadas no package-lock.json

### Vulnerabilidades frontend conhecidas (2026-04-23)

| Pacote | Severidade | Detalhe | Correção |
|---|---|---|---|
| `jspdf` | **Critical** | Dependência vulnerável (dompurify) | Aguardar patch do jsPDF ou substituir |
| `esbuild` via `vite` | Moderate | Dev server aceita requisições cross-origin | Upgrade Vite 5→8 (breaking change — requer teste) |
| `dompurify` | Moderate | Via jsPDF | Corrigido quando jsPDF for atualizado |
| `vite` | Moderate | Via esbuild | Idem |

**Ação recomendada**: Rodar `npm audit fix --force --workspace=frontend` em um branch separado, testar as ferramentas de PDF (equity, tax) e fazer merge se não houver regressão. Prioridade: antes do lançamento público.

## CONFIGURAÇÃO DO SUPABASE

- [ ] Row Level Security (RLS) habilitado em TODAS as tabelas
- [ ] Policies RLS verificadas: usuários acessam apenas os próprios dados
- [ ] Service role key usada apenas no backend — nunca no frontend
- [ ] Anon key com permissões mínimas
- [ ] Bucket `avatars` configurado como privado (acesso autenticado)
- [ ] Redirect URLs autorizadas cadastradas: `https://ferramentas.safie.com.br/auth/callback` e `http://localhost:5173/auth/callback`

## CONFIGURAÇÃO DO GOOGLE CLOUD CONSOLE

- [ ] Authorized redirect URIs incluem: `https://ferramentas.safie.com.br/auth/callback`
- [ ] Authorized redirect URIs incluem: `http://localhost:5173/auth/callback`

---

## Ferramentas de Validação Externa

| Ferramenta | URL | Meta |
|---|---|---|
| SSL Labs | https://www.ssllabs.com/ssltest/ | Nota A+ |
| Security Headers | https://securityheaders.com | Nota A |
| Mozilla Observatory | https://observatory.mozilla.org | Nota A+ |
