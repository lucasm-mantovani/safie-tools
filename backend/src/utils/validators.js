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
