// TODO: adicionar drag-and-drop com @dnd-kit quando disponível
import { useEquity, PARTNER_COLORS } from './EquityContext'
import Button from '../../../components/ui/Button'

function Avatar({ name, color }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?'
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-cta text-sm font-bold text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default function StepPartnersSetup() {
  const { partners, addPartner, removePartner, updatePartnerName, goToStep } = useEquity()

  const allNamed = partners.every(p => p.name.trim().length >= 2)

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Sócios</h2>
          {partners.length < 6 && (
            <button
              onClick={addPartner}
              className="flex items-center gap-1.5 font-cta text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar sócio
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {partners.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar name={p.name} color={p.color} />
              <input
                type="text"
                value={p.name}
                onChange={e => updatePartnerName(p.id, e.target.value)}
                placeholder={`Sócio ${i + 1} — nome completo`}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {partners.length > 2 && (
                <button
                  onClick={() => removePartner(p.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="font-body text-xs text-gray-400 mt-4">
          Mínimo 2, máximo 6 sócios. A ordem importa — será usada na avaliação.
        </p>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('DIMENSION_WEIGHTS')}
        disabled={!allNamed}
        className="w-full"
      >
        Continuar para pesos →
      </Button>

      {!allNamed && (
        <p className="font-body text-xs text-gray-400 text-center mt-3">
          Preencha o nome de todos os sócios para continuar.
        </p>
      )}
    </div>
  )
}
