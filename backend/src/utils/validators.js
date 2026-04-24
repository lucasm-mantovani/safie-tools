import { z } from 'zod'

// Registro: user_id obrigatório (vem do Supabase Auth), full_name e email obrigatórios
// Demais campos opcionais — usuários OAuth podem não ter todos os dados no primeiro cadastro
export const registerSchema = z.object({
  user_id: z.string().uuid('user_id deve ser um UUID válido'),
  full_name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  business_segment: z.string().optional().nullable(),
})

// Atualização de perfil: pelo menos um campo deve estar presente
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  phone: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  business_segment: z.string().optional().nullable(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'Envie ao menos um campo para atualizar' },
)

// Sessão de ferramenta
export const toolSessionSchema = z.object({
  tool_slug: z.string().min(1, 'tool_slug é obrigatório'),
  input_data: z.record(z.unknown()).optional(),
  output_data: z.record(z.unknown()).optional(),
  qualification_data: z.record(z.unknown()).optional(),
})

// Equity Calculator
const partnerSchema = z.object({
  name: z.string().min(1, 'Nome do sócio é obrigatório'),
  financial: z.number().min(0).max(100),
  dedication: z.number().min(0).max(100),
  technical: z.number().min(0).max(100),
  commercial: z.number().min(0).max(100),
  network: z.number().min(0).max(100),
})

export const equityCalculatorSchema = z.object({
  partners: z.array(partnerSchema).min(2, 'Informe ao menos 2 sócios').max(10, 'Máximo de 10 sócios'),
  company_status: z.enum(['pre_operacional', 'operacional', 'faturando']),
  has_shareholders_agreement: z.enum(['sim', 'nao', 'em_elaboracao']),
  business_segment: z.string().min(1, 'Segmento é obrigatório'),
})

// Tax Better (legado — mantido para compatibilidade)
export const taxBetterSchema = z.object({
  annual_revenue_range: z.enum(['ate_81k', '81k_360k', '360k_1M', '1M_4_8M', '4_8M_78M', 'acima_78M']),
  current_regime: z.enum(['mei', 'simples', 'lucro_presumido', 'lucro_real', 'nao_sei']),
  activity_type: z.enum(['servicos', 'produtos', 'misto']),
  profit_margin: z.enum(['ate_10', '10_a_20', '20_a_30', 'acima_30']),
  last_reviewed: z.enum(['nunca', 'menos_1_ano', '1_a_2_anos', 'mais_2_anos']),
})

// Tax Diagnostic — schema completo
const partnerRemunerationItemSchema = z.object({
  prolabore: z.number().min(0),
  profit_distribution: z.number().min(0),
})

export const taxDiagnosticSchema = z.object({
  company_profile: z.object({
    activity_type: z.enum(['servicos', 'produtos', 'misto']),
    current_regime: z.enum(['mei', 'simples', 'lucro_presumido', 'lucro_real', 'nao_sei']),
    state: z.string().optional(),
    company_stage: z.string().optional(),
    cnae: z.string().optional(),
  }),
  revenue_data: z.object({
    monthly_revenue: z.number().positive('Faturamento mensal é obrigatório'),
    services_revenue_pct: z.number().min(0).max(100).default(100),
    products_revenue_pct: z.number().min(0).max(100).default(0),
    has_seasonal_revenue: z.boolean().default(false),
    has_export_revenue: z.boolean().default(false),
    has_financial_revenue: z.boolean().default(false),
  }),
  cost_structure: z.object({
    payroll: z.number().min(0).default(0),
    documented_supplier_costs: z.number().min(0).default(0),
    rent: z.number().min(0).default(0),
    equipment_depreciation: z.number().min(0).default(0),
    other_documented_costs: z.number().min(0).default(0),
    rd_investment: z.number().min(0).default(0),
  }).default({}),
  partner_remuneration: z.object({
    partners_count: z.number().int().min(1).default(1),
    total_prolabore: z.number().min(0).default(0),
    total_profit_distribution: z.number().min(0).default(0),
    partners: z.array(partnerRemunerationItemSchema).default([]),
  }).default({}),
  supplementary_data: z.object({
    has_accountant: z.enum(['sim', 'nao', 'insatisfeito']).optional(),
    last_regime_review: z.enum(['nunca', 'menos_1_ano', '1_a_2_anos', 'mais_2_anos']).optional(),
    has_rd_investment: z.boolean().default(false),
    has_export_revenue: z.boolean().default(false),
    has_real_estate: z.boolean().default(false),
    iss_rate: z.number().min(0).max(0.05).default(0.05),
  }).default({}),
  qualification_data: z.record(z.unknown()).default({}),
})

// Labor Risk
const contractorSchema = z.object({
  name: z.string().min(1, 'Nome do prestador é obrigatório'),
  exclusivity: z.boolean(),
  subordination: z.boolean(),
  regularity: z.boolean(),
  time_control: z.boolean(),
  equipment_provided: z.boolean(),
})

export const laborRiskSchema = z.object({
  contractors: z.array(contractorSchema).min(1, 'Informe ao menos 1 prestador').max(10, 'Máximo de 10 prestadores'),
  has_had_lawsuit: z.boolean(),
})

// Fast Due Diligence
export const fastDueDiligenceSchema = z.object({
  operation_type: z.enum(['captacao', 'ma', 'venda_participacao']),
  timeline_months: z.enum(['ate_3', '3_a_6', '6_a_12', 'acima_12']),
  has_legal_advisor: z.boolean(),
  company_size: z.enum(['micro', 'pequena', 'media', 'grande']),
  has_shareholders_agreement: z.boolean(),
})

// Litigation Cost
export const litigationCostSchema = z.object({
  conflict_type: z.enum(['trabalhista', 'civel', 'societario', 'fiscal']),
  dispute_value_range: z.enum(['ate_10k', '10k_50k', '50k_200k', '200k_1M', 'acima_1M']),
  has_lawyer: z.boolean(),
  instance: z.enum(['primeira', 'segunda', 'superior']),
  estimated_duration: z.enum(['ate_1_ano', '1_a_3_anos', 'acima_3_anos']),
  success_probability: z.number().min(0).max(100),
})

// Partners Cash
export const partnersCashSchema = z.object({
  monthly_revenue_range: z.enum(['ate_10k', '10k_30k', '30k_80k', '80k_200k', 'acima_200k']),
  tax_regime: z.enum(['simples', 'lucro_presumido', 'lucro_real']),
  current_prolabore_range: z.enum(['salario_minimo', 'ate_5k', '5k_a_10k', '10k_a_20k', 'acima_20k']),
  partners_receiving: z.number().min(1).max(10),
  has_accountant: z.boolean(),
})

// Equity Calculator — novo modelo com 4 dimensões
const capitalEvalSchema = z.object({
  financial_investment: z.number().min(0),
  non_financial_assets: z.number().min(0),
  financial_guarantees: z.number().min(1).max(5),
})

const workEvalSchema = z.object({
  weekly_hours: z.number().min(0).max(168),
  role_type: z.enum(['founder', 'ceo', 'cto', 'coo', 'cmo', 'vp', 'manager', 'specialist', 'other']),
  years_experience: z.number().min(0).max(50),
  pre_company_dedication_months: z.number().min(0).max(120),
  pre_company_dedication_intensity: z.enum(['full', 'partial']),
})

const knowledgeEvalSchema = z.object({
  intellectual_property: z.number().min(0).max(5),
  ip_criticality: z.enum(['critical', 'important', 'helpful']),
  network_and_market_access: z.number().min(0).max(5),
  technical_expertise: z.number().min(0).max(5),
  tech_criticality: z.enum(['critical', 'important', 'helpful']),
})

const riskEvalSchema = z.object({
  opportunity_cost: z.enum(['no_sacrifice', 'partial', 'significant', 'full_salary_sacrificed']),
  vesting_acceptance: z.enum(['yes', 'negotiable', 'no']),
  exclusivity: z.enum(['exclusive', 'partial', 'non_exclusive']),
})

const evaluationItemSchema = z.object({
  partner_index: z.number().int().min(0),
  capital: capitalEvalSchema,
  work: workEvalSchema,
  knowledge: knowledgeEvalSchema,
  risk: riskEvalSchema,
})

export const equitySessionSchema = z.object({
  business_briefing: z.object({
    company_stage: z.string().optional().nullable(),
    founders_type: z.string().optional().nullable(),
    has_shareholders_agreement: z.enum(['sim', 'nao', 'em_elaboracao', 'rascunho_sem_advogado']),
    business_segment: z.string().min(1),
    company_status: z.string().optional().nullable(),
  }),
  partners: z.array(z.object({
    name: z.string().min(1),
    color: z.string().optional(),
  })).min(2).max(6),
  dimension_weights: z.object({
    capital: z.number().min(0).max(100),
    work: z.number().min(0).max(100),
    knowledge: z.number().min(0).max(100),
    risk: z.number().min(0).max(100),
  }),
  evaluations: z.array(evaluationItemSchema).min(2).max(6),
  qualification_data: z.record(z.unknown()).optional(),
})

export const equityInviteSchema = z.object({
  session_id: z.string().uuid(),
  invitee_email: z.string().email(),
  invitee_name: z.string().min(1),
  partner_index: z.number().int().min(0),
})

// Due Diligence Checklist
const checklistResponseSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['ok', 'parcial', 'ausente', 'nao_aplicavel']),
  founder_description: z.string().max(300).optional(),
})

export const dueDiligenceSessionSchema = z.object({
  operation_type: z.enum(['captacao', 'ma']),
  company_snapshot: z.object({
    company_name: z.string().min(1),
    founding_year: z.number().int().min(1900).max(2030).optional(),
    business_segment: z.string().optional(),
    current_stage: z.string().optional(),
    monthly_revenue_range: z.string().optional(),
    employees_count_range: z.string().optional(),
    has_previous_funding: z.boolean().optional(),
    has_legal_advisor: z.enum(['sim', 'nao', 'buscando']).optional(),
  }),
  checklist_responses: z.array(checklistResponseSchema).min(1),
  qualification_data: z.record(z.unknown()).default({}),
})

// Middleware de validação reutilizável
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.errors[0]?.message || 'Dados inválidos'
      return res.status(400).json({ message, field: result.error.errors[0]?.path[0] })
    }
    // Substitui req.body pelos dados validados e limpos pelo Zod
    req.body = result.data
    next()
  }
}
