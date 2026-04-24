import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { DDProvider, useDD } from './DDContext'
import DDErrorBoundary from './DDErrorBoundary'
import StepIntro from './StepIntro'
import StepCompanySnapshot from './StepCompanySnapshot'
import StepChecklist from './StepChecklist'
import QualificationModal from './QualificationModal'
import StepResults from './StepResults'

const CHECKLIST_STEPS = ['COMPANY_SNAPSHOT', 'CHECKLIST']
const STEP_LABELS = ['Empresa', 'Checklist']

function StepIndicator({ currentStep }) {
  const current = CHECKLIST_STEPS.indexOf(currentStep)
  if (current === -1) return null
  return (
    <div className="flex items-center gap-1 mb-8">
      {CHECKLIST_STEPS.map((_, i) => {
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
            {i < CHECKLIST_STEPS.length - 1 && <div className="w-4 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

function ResumePrompt({ onResume, onRestart }) {
  return (
    <div className="min-h-screen bg-safie-light flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-heading text-xl font-bold text-bg-dark mb-2">Diagnóstico em andamento</h2>
        <p className="font-body text-sm text-gray-500 mb-6">
          Encontramos um diagnóstico salvo. Deseja continuar de onde parou?
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onResume}
            className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark transition-colors px-5 py-3 rounded-xl"
          >
            Continuar de onde parei
          </button>
          <button
            onClick={onRestart}
            className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2"
          >
            Começar um novo diagnóstico
          </button>
        </div>
      </div>
    </div>
  )
}

function DDFlow() {
  const navigate = useNavigate()
  const { currentStep, operationType, goToStep, resetAll } = useDD()
  const [showResume] = useState(() => {
    try {
      const saved = localStorage.getItem('safie_dd_draft')
      if (!saved) return false
      const parsed = JSON.parse(saved)
      return !!(parsed.currentStep && parsed.currentStep !== 'INTRO' && parsed.currentStep !== 'RESULTS')
    } catch { return false }
  })
  const [resumeDismissed, setResumeDismissed] = useState(false)

  if (showResume && !resumeDismissed) {
    return (
      <ResumePrompt
        onResume={() => setResumeDismissed(true)}
        onRestart={() => { resetAll(); setResumeDismissed(true) }}
      />
    )
  }

  const isResults = currentStep === 'RESULTS'
  const isIntro = currentStep === 'INTRO'
  const isQualification = currentStep === 'QUALIFICATION_MODAL'

  function handleBack() {
    if (isIntro) return navigate('/dashboard')
    if (currentStep === 'COMPANY_SNAPSHOT') return goToStep('INTRO')
    if (currentStep === 'CHECKLIST') return goToStep('COMPANY_SNAPSHOT')
    navigate('/dashboard')
  }

  return (
    <div className="relative min-h-screen bg-safie-light">
      <div className={`mx-auto px-4 sm:px-6 py-8 sm:py-12 ${currentStep === 'CHECKLIST' ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {!isResults && (
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {isIntro ? 'Dashboard' : 'Voltar'}
            </button>

            {!isQualification && (
              <>
                <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                  Ferramenta 4 de 6
                </p>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark mb-2">
                  Fast Due Diligence
                </h1>
                {!isIntro && (
                  <p className="font-body text-sm text-gray-500">
                    Diagnóstico de prontidão para{' '}
                    {operationType === 'captacao' ? 'captação de investimento' : 'operação de M&A'}.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {!isResults && !isQualification && !isIntro && (
          <StepIndicator currentStep={currentStep} />
        )}

        {currentStep === 'INTRO' && <StepIntro />}
        {currentStep === 'COMPANY_SNAPSHOT' && <StepCompanySnapshot />}
        {currentStep === 'CHECKLIST' && <StepChecklist />}
        {currentStep === 'RESULTS' && (
          <StepResults onReset={() => { resetAll(); navigate('/dashboard') }} />
        )}
        {isQualification && <QualificationModal />}

        {!isResults && !isIntro && !isQualification && (
          <p className="font-body text-xs text-gray-400 text-center mt-6">
            Diagnóstico informativo — não substitui assessoria jurídica ou financeira especializada
          </p>
        )}
      </div>
    </div>
  )
}

export default function FastDueDiligence() {
  const { profile } = useAuth()

  return (
    <DDErrorBoundary>
      <DDProvider
        initialCompanyName={profile?.company_name || ''}
        initialSegment={profile?.business_segment || ''}
      >
        <DDFlow />
      </DDProvider>
    </DDErrorBoundary>
  )
}
