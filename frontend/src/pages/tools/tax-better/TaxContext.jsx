import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const LS_KEY = 'safie_tax_draft'

function makeInitialState() {
  return {
    currentStep: 'INTRO',
    companyProfile: { activity_type: null, current_regime: null, state: null, company_stage: null, cnae: '' },
    revenueData: {
      monthly_revenue: '',
      services_revenue_pct: 100,
      products_revenue_pct: 0,
      has_seasonal_revenue: null,
      has_export_revenue: null,
      has_financial_revenue: null,
    },
    costStructure: {
      payroll: '',
      documented_supplier_costs: '',
      rent: '',
      equipment_depreciation: '',
      other_documented_costs: '',
      rd_investment: '',
    },
    partnerRemuneration: {
      partners_count: 1,
      partners: [{ prolabore: '', profit_distribution: '' }],
    },
    supplementaryData: {
      has_accountant: null,
      last_regime_review: null,
      has_rd_investment: null,
      has_export_revenue: null,
      has_real_estate: null,
      iss_rate: '',
    },
    qualificationData: {},
    results: null,
    sessionId: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'UPDATE_COMPANY_PROFILE':
      return { ...state, companyProfile: { ...state.companyProfile, [action.field]: action.value } }

    case 'UPDATE_REVENUE_DATA':
      return { ...state, revenueData: { ...state.revenueData, [action.field]: action.value } }

    case 'UPDATE_COST_STRUCTURE':
      return { ...state, costStructure: { ...state.costStructure, [action.field]: action.value } }

    case 'SET_PARTNER_COUNT': {
      const count = Math.max(1, Math.min(10, action.count))
      const partners = Array.from({ length: count }, (_, i) =>
        state.partnerRemuneration.partners[i] || { prolabore: '', profit_distribution: '' }
      )
      return { ...state, partnerRemuneration: { ...state.partnerRemuneration, partners_count: count, partners } }
    }

    case 'UPDATE_PARTNER': {
      const partners = state.partnerRemuneration.partners.map((p, i) =>
        i === action.index ? { ...p, [action.field]: action.value } : p
      )
      return { ...state, partnerRemuneration: { ...state.partnerRemuneration, partners } }
    }

    case 'UPDATE_SUPPLEMENTARY':
      return { ...state, supplementaryData: { ...state.supplementaryData, [action.field]: action.value } }

    case 'SET_QUALIFICATION_DATA':
      return { ...state, qualificationData: action.data }

    case 'SET_RESULTS':
      return { ...state, results: action.results, sessionId: action.sessionId, currentStep: 'RESULTS' }

    case 'RESET':
      return makeInitialState()

    default:
      return state
  }
}

const TaxContext = createContext(null)

export function TaxProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.currentStep && parsed.currentStep !== 'RESULTS') return parsed
      }
    } catch {}
    return makeInitialState()
  })

  useEffect(() => {
    if (state.currentStep !== 'RESULTS') {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    }
  }, [state])

  const goToStep = useCallback(step => dispatch({ type: 'SET_STEP', step }), [])
  const updateCompanyProfile = useCallback((field, value) => dispatch({ type: 'UPDATE_COMPANY_PROFILE', field, value }), [])
  const updateRevenueData = useCallback((field, value) => dispatch({ type: 'UPDATE_REVENUE_DATA', field, value }), [])
  const updateCostStructure = useCallback((field, value) => dispatch({ type: 'UPDATE_COST_STRUCTURE', field, value }), [])
  const setPartnerCount = useCallback(count => dispatch({ type: 'SET_PARTNER_COUNT', count }), [])
  const updatePartner = useCallback((index, field, value) => dispatch({ type: 'UPDATE_PARTNER', index, field, value }), [])
  const updateSupplementary = useCallback((field, value) => dispatch({ type: 'UPDATE_SUPPLEMENTARY', field, value }), [])
  const setQualificationData = useCallback(data => dispatch({ type: 'SET_QUALIFICATION_DATA', data }), [])
  const setResults = useCallback((results, sessionId) => dispatch({ type: 'SET_RESULTS', results, sessionId }), [])
  const resetAll = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <TaxContext.Provider value={{
      ...state,
      goToStep,
      updateCompanyProfile,
      updateRevenueData,
      updateCostStructure,
      setPartnerCount,
      updatePartner,
      updateSupplementary,
      setQualificationData,
      setResults,
      resetAll,
    }}>
      {children}
    </TaxContext.Provider>
  )
}

export function useTax() {
  const ctx = useContext(TaxContext)
  if (!ctx) throw new Error('useTax deve ser usado dentro de TaxProvider')
  return ctx
}
