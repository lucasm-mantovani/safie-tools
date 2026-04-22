import { useNavigate } from 'react-router-dom'
import { EquityProvider, useEquity } from './EquityContext'
import StepBriefing from './StepBriefing'
import StepPartnersSetup from './StepPartnersSetup'
import StepDimensionWeights from './StepDimensionWeights'
import StepPartnerEvaluation from './StepPartnerEvaluation'
import StepComparativeReview from './StepComparativeReview'
import QualificationModal from './QualificationModal'
import StepResults from './StepResults'

const STEP_ORDER = ['BRIEFING', 'PARTNERS_SETUP', 'DIMENSION_WEIGHTS', 'PARTNER_EVALUATION', 'COMPARATIVE_REVIEW']
const STEP_LABELS = ['Contexto', 'Sócios', 'Pesos', 'Avaliação', 'Revisão']

function StepIndicator({ currentStep }) {
  const current = STEP_ORDER.indexOf(currentStep)
  if (current === -1) return null
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEP_ORDER.map((_, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center gap-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors
              ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              {done
                ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : i + 1}
            </div>
            <span className={`font-cta text-xs font-medium hidden sm:block ${active ? 'text-bg-dark' : 'text-gray-400'}`}>
              {STEP_LABELS[i]}
            </span>
            {i < STEP_ORDER.length - 1 && <div className="w-4 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

function EquityFlow() {
  const navigate = useNavigate()
  const { currentStep, goToStep, resetAll } = useEquity()

  function handleBack() {
    const idx = STEP_ORDER.indexOf(currentStep)
    if (idx > 0) goToStep(STEP_ORDER[idx - 1])
    else navigate('/dashboard')
  }

  const isResults = currentStep === 'RESULTS'
  const isQualification = currentStep === 'QUALIFICATION_MODAL'

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        {!isResults && (
          <div className="mb-10">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {STEP_ORDER.indexOf(currentStep) > 0 ? 'Voltar' : 'Dashboard'}
            </button>
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Ferramenta 1 de 6
            </p>
            <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">
              Calculadora de Participações
            </h1>
            <p className="font-body text-sm text-gray-500">
              Divida cotas entre sócios com critérios objetivos baseados em 4 dimensões.
            </p>
          </div>
        )}

        {/* Step indicator — só nos steps lineares */}
        {!isResults && !isQualification && (
          <StepIndicator currentStep={currentStep} />
        )}

        {/* Step machine */}
        {currentStep === 'BRIEFING' && <StepBriefing />}
        {currentStep === 'PARTNERS_SETUP' && <StepPartnersSetup />}
        {currentStep === 'DIMENSION_WEIGHTS' && <StepDimensionWeights />}
        {currentStep === 'PARTNER_EVALUATION' && <StepPartnerEvaluation />}
        {currentStep === 'COMPARATIVE_REVIEW' && <StepComparativeReview />}
        {currentStep === 'RESULTS' && <StepResults onReset={() => { resetAll(); navigate('/dashboard') }} />}

        {/* Modal de qualificação — sobrepõe qualquer step */}
        {isQualification && <QualificationModal />}
      </div>
    </div>
  )
}

export default function EquityCalculator() {
  return (
    <EquityProvider>
      <EquityFlow />
    </EquityProvider>
  )
}
