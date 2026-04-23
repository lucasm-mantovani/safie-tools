import { useTax } from './TaxContext'
import Button from '../../../components/ui/Button'

const INSS_TETO = 7786.02
const INSS_RATE = 0.11

function parseBRL(str) {
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0
}

function maskBRL(value) {
  const num = String(value).replace(/\D/g, '')
  if (!num) return ''
  return (parseInt(num) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calcINSS(prolabore) {
  const base = Math.min(parseBRL(prolabore), INSS_TETO)
  return base > 0 ? base * INSS_RATE : 0
}

export default function StepPartnerRemuneration() {
  const { partnerRemuneration, setPartnerCount, updatePartner, goToStep } = useTax()
  const { partners_count, partners } = partnerRemuneration

  const canAdvance = partners.every(p => p.prolabore && parseBRL(p.prolabore) > 0)

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <p className="font-body text-sm font-medium text-gray-700">Quantos sócios tem a empresa?</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPartnerCount(partners_count - 1)}
              disabled={partners_count <= 1}
              className="w-8 h-8 rounded-lg border border-gray-200 font-bold text-gray-600 hover:border-primary/40 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <span className="font-cta text-base font-bold text-bg-dark w-4 text-center">{partners_count}</span>
            <button
              onClick={() => setPartnerCount(partners_count + 1)}
              disabled={partners_count >= 10}
              className="w-8 h-8 rounded-lg border border-gray-200 font-bold text-gray-600 hover:border-primary/40 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {partners.map((p, i) => {
            const inss = calcINSS(p.prolabore)
            const atTeto = parseBRL(p.prolabore) >= INSS_TETO
            return (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                  Sócio {i + 1}
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="font-body text-xs font-medium text-gray-600 mb-1 block">
                      Pró-labore mensal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-gray-400">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={p.prolabore}
                        onChange={e => updatePartner(i, 'prolabore', maskBRL(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                      />
                    </div>
                    {inss > 0 && (
                      <p className="font-body text-xs text-gray-400 mt-1">
                        INSS estimado: R$ {inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {atTeto && ' (teto atingido)'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-body text-xs font-medium text-gray-600 mb-1 block">
                      Distribuição de lucros mensal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-gray-400">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={p.profit_distribution}
                        onChange={e => updatePartner(i, 'profit_distribution', maskBRL(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                      />
                    </div>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      Distribuição de lucros é isenta de IR para o sócio (exceto no MEI).
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Button variant="primary" size="md" onClick={() => goToStep('SUPPLEMENTARY')} disabled={!canAdvance} className="w-full">
        Continuar →
      </Button>
    </div>
  )
}
