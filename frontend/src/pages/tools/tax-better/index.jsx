import { useNavigate } from 'react-router-dom'
import { TaxProvider, useTax } from './TaxContext'
import StepIntro from './StepIntro'
import StepCompanyProfile from './StepCompanyProfile'
import StepRevenueData from './StepRevenueData'
import StepCostStructure from './StepCostStructure'
import StepPartnerRemuneration from './StepPartnerRemuneration'
import StepSupplementary from './StepSupplementary'
import QualificationModal from './QualificationModal'
import StepResults from './StepResults'

const STEP_ORDER = ['COMPANY_PROFILE', 'REVENUE_DATA', 'COST_STRUCTURE', 'PARTNER_REMUNERATION', 'SUPPLEMENTARY']
const STEP_LABELS = ['Perfil', 'Receita', 'Custos', 'Sócios', 'Complementar']

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
              ${done || active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
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

function TaxFlow() {
  const navigate = useNavigate()
  const { currentStep, goToStep, resetAll } = useTax()

  function handleBack() {
    const idx = STEP_ORDER.indexOf(currentStep)
    if (currentStep === 'INTRO') return navigate('/dashboard')
    if (idx === 0) return goToStep('INTRO')
    if (idx > 0) return goToStep(STEP_ORDER[idx - 1])
    navigate('/dashboard')
  }

  const isResults = currentStep === 'RESULTS'
  const isQualification = currentStep === 'QUALIFICATION_MODAL'
  const isIntro = currentStep === 'INTRO'

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {!isResults && (
          <div className="mb-10">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {isIntro ? 'Dashboard' : STEP_ORDER.indexOf(currentStep) === 0 ? 'Voltar ao início' : 'Voltar'}
            </button>
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Ferramenta 2 de 6
            </p>
            <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Tax Better</h1>
            <p className="font-body text-sm text-gray-500">
              Diagnóstico tributário completo — descubra quanto sua empresa pode economizar.
            </p>
          </div>
        )}

        {!isResults && !isQualification && !isIntro && (
          <StepIndicator currentStep={currentStep} />
        )}

        {currentStep === 'INTRO' && <StepIntro />}
        {currentStep === 'COMPANY_PROFILE' && <StepCompanyProfile />}
        {currentStep === 'REVENUE_DATA' && <StepRevenueData />}
        {currentStep === 'COST_STRUCTURE' && <StepCostStructure />}
        {currentStep === 'PARTNER_REMUNERATION' && <StepPartnerRemuneration />}
        {currentStep === 'SUPPLEMENTARY' && <StepSupplementary />}
        {currentStep === 'RESULTS' && <StepResults onReset={() => { resetAll(); navigate('/dashboard') }} />}

        {isQualification && <QualificationModal />}
      </div>
    </div>
  )
}

export default function TaxBetter() {
  return (
    <TaxProvider>
      <TaxFlow />
    </TaxProvider>
  )
}
