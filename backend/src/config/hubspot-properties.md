# SAFIE Tools — Propriedades Customizadas do HubSpot

> Crie estas propriedades no HubSpot em: Configurações → Propriedades → Contatos → Criar propriedade
> Portal ID: configurado em HUBSPOT_PORTAL_ID

---

## Propriedades Gerais (todas as ferramentas)

| Nome interno | Label | Tipo | Descrição |
|---|---|---|---|
| `safie_tools_registered` | Cadastrado no SAFIE Tools | Boolean | Usuário criou conta na plataforma |
| `safie_tools_last_tool_used` | Última ferramenta usada | String (text) | Slug da última ferramenta utilizada |
| `safie_tools_sessions_count` | Total de sessões | Number | Número total de ferramentas utilizadas |

---

## Ferramenta 1 — Calculadora de Divisão de Participações Societárias
Slug: `equity-calculator`

| Nome interno | Label | Tipo | Valores/Opções |
|---|---|---|---|
| `equity_company_status` | Status da empresa | Enum | `aberta` = Empresa aberta; `em_abertura` = Em processo de abertura |
| `equity_has_shareholders_agreement` | Possui acordo de sócios | Enum | `sim` = Sim; `nao` = Não; `em_elaboracao` = Em elaboração |
| `equity_business_segment` | Segmento da empresa | String (text) | Texto livre |
| `equity_partners_count` | Número de sócios | Number | — |
| `equity_sql_tag` | SQL — Sem acordo de sócios | Boolean | **TRUE** se não possui acordo de sócios → acionar oferta de elaboração de acordo |

**Gatilho comercial:** `equity_sql_tag = true` → Lead qualificado para oferta de Acordo de Sócios

---

## Ferramenta 2 — Diagnóstico de Regime Tributário
Slug: `tax-regime-diagnostic`

| Nome interno | Label | Tipo | Valores/Opções |
|---|---|---|---|
| `tax_annual_revenue_range` | Faixa de faturamento anual | Enum | `ate_360k`; `360k_1m`; `1m_3m`; `3m_4_8m`; `acima_4_8m` |
| `tax_current_regime` | Regime tributário atual | Enum | `simples`; `lucro_presumido`; `lucro_real`; `nao_sei` |
| `tax_last_reviewed` | Última revisão tributária | Enum | `nunca`; `mais_1_ano`; `menos_1_ano` |
| `tax_sql_tag` | SQL — Regime potencialmente subótimo | Boolean | **TRUE** se faturamento acima de R$500k e última revisão há mais de 1 ano ou nunca |

**Gatilho comercial:** `tax_sql_tag = true` → Lead qualificado para oferta de Planejamento Tributário

---

## Ferramenta 3 — Calculadora de Risco de Contratação PJ
Slug: `pj-risk-calculator`

| Nome interno | Label | Tipo | Valores/Opções |
|---|---|---|---|
| `pj_contractors_count` | Total de prestadores PJ | Number | — |
| `pj_high_risk_count` | Prestadores PJ de alto risco | Number | — |
| `pj_has_had_lawsuit` | Já sofreu processo trabalhista | Enum | `sim`; `nao` |
| `pj_sql_tag` | SQL — Alto risco trabalhista | Boolean | **TRUE** se 2 ou mais prestadores classificados como alto risco |

**Gatilho comercial:** `pj_sql_tag = true` → Lead qualificado para oferta de Auditoria de Contratos PJ

---

## Ferramenta 4 — Gerador de Checklist de Due Diligence
Slug: `due-diligence-checklist`

| Nome interno | Label | Tipo | Valores/Opções |
|---|---|---|---|
| `dd_operation_type` | Tipo de operação | Enum | `captacao`; `ma` = M&A; `venda_participacao` |
| `dd_timeline_months` | Prazo da operação | Enum | `0_3`; `3_6`; `6_12`; `mais_12` |
| `dd_has_legal_advisor` | Possui assessor jurídico | Enum | `sim`; `nao` |
| `dd_sql_tag` | SQL — Sem assessor para operação urgente | Boolean | **TRUE** se operação em até 6 meses e sem assessor jurídico |

**Gatilho comercial:** `dd_sql_tag = true` → Lead qualificado para oferta de Assessoria em M&A

---

## Ferramenta 5 — Simulador de Custo de Litígio
Slug: `litigation-cost-simulator`

| Nome interno | Label | Tipo | Valores/Opções |
|---|---|---|---|
| `litigation_conflict_type` | Tipo de conflito | Enum | `trabalhista`; `civel`; `societario`; `fiscal` |
| `litigation_dispute_value` | Valor em disputa | Enum | `ate_50k`; `50k_200k`; `200k_500k`; `acima_500k` |
| `litigation_has_lawyer` | Possui advogado | Enum | `sim`; `nao` |
| `litigation_sql_tag` | SQL — Disputa relevante sem advogado | Boolean | **TRUE** se disputa acima de R$50k e sem advogado |

**Gatilho comercial:** `litigation_sql_tag = true` → Lead qualificado para oferta de Representação Judicial

---

## Ferramenta 6 — Calculadora de Pró-labore Ideal
Slug: `prolabore-calculator`

| Nome interno | Label | Tipo | Valores/Opções |
|---|---|---|---|
| `prolabore_monthly_revenue` | Faturamento mensal | Enum | `ate_50k`; `50k_150k`; `150k_500k`; `acima_500k` |
| `prolabore_current_regime` | Regime tributário atual | Enum | `simples`; `lucro_presumido`; `lucro_real` |
| `prolabore_has_accountant` | Possui contador ativo | Enum | `sim`; `nao` |
| `prolabore_sql_tag` | SQL — Sem contador | Boolean | **TRUE** se não possui contador ativo |

**Gatilho comercial:** `prolabore_sql_tag = true` → Lead qualificado para oferta de Contabilidade SAFIE

---

## Notas de Implementação

- Todas as propriedades booleanas SQL (sufixo `_sql_tag`) devem ser avaliadas no backend antes de enviar ao HubSpot
- A lógica de qualificação fica em `backend/src/services/hubspotService.js`
- Nunca enviar a chave de API do HubSpot ao frontend
- Em caso de conflito de contato (e-mail duplicado), buscar o existente pelo e-mail e atualizar
