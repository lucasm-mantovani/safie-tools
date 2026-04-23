import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const PARTNER_COLORS = ['#154efa', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
const LS_KEY = 'safie_equity_draft'

const DEFAULT_EVAL = {
  capital: { financial_investment: 0, non_financial_assets: 0, financial_guarantees: 1 },
  work: { weekly_hours: 40, role_type: 'founder', years_experience: 0, pre_company_dedication_months: 0, pre_company_dedication_intensity: 'full' },
  knowledge: { intellectual_property: 1, ip_criticality: 'helpful', network_and_market_access: 1, technical_expertise: 1, tech_criticality: 'helpful' },
  risk: { opportunity_cost: 'no_sacrifice', vesting_acceptance: 'yes', exclusivity: 'exclusive' },
}

const DEFAULT_WEIGHTS = { capital: 30, work: 35, knowledge: 20, risk: 15 }

function makePartner(index) {
  return { id: Date.now() + index, name: '', color: PARTNER_COLORS[index % PARTNER_COLORS.length] }
}

function makeInitialState() {
  return {
    currentStep: 'BRIEFING',
    businessBriefing: { company_stage: null, founders_type: null, has_shareholders_agreement: null, business_segment: null, company_status: null },
    partners: [makePartner(0), makePartner(1)],
    dimensionWeights: { ...DEFAULT_WEIGHTS },
    suggestedWeights: { ...DEFAULT_WEIGHTS },
    evaluations: { 0: structuredClone(DEFAULT_EVAL), 1: structuredClone(DEFAULT_EVAL) },
    qualificationData: {},
    results: null,
    sessionId: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'UPDATE_BRIEFING': {
      const briefing = { ...state.businessBriefing, [action.field]: action.value }
      return { ...state, businessBriefing: briefing }
    }

    case 'SET_SUGGESTED_WEIGHTS':
      return { ...state, suggestedWeights: action.weights, dimensionWeights: action.weights }

    case 'SET_DIMENSION_WEIGHTS':
      return { ...state, dimensionWeights: action.weights }

    case 'SET_PARTNER_COUNT': {
      const count = Math.min(6, Math.max(2, action.count))
      const partners = Array.from({ length: count }, (_, i) =>
        state.partners[i] || makePartner(Date.now() + i)
      )
      const evaluations = {}
      partners.forEach((_, i) => {
        evaluations[i] = state.evaluations[i] || structuredClone(DEFAULT_EVAL)
      })
      return { ...state, partners, evaluations }
    }

    case 'ADD_PARTNER': {
      if (state.partners.length >= 6) return state
      const newIndex = state.partners.length
      const partner = makePartner(Date.now())
      return {
        ...state,
        partners: [...state.partners, partner],
        evaluations: { ...state.evaluations, [newIndex]: structuredClone(DEFAULT_EVAL) },
      }
    }

    case 'REMOVE_PARTNER': {
      if (state.partners.length <= 2) return state
      const partners = state.partners.filter(p => p.id !== action.id)
      const evaluations = {}
      partners.forEach((_, i) => {
        const oldIdx = state.partners.findIndex(p => p.id === partners[i].id)
        evaluations[i] = state.evaluations[oldIdx] || structuredClone(DEFAULT_EVAL)
      })
      return { ...state, partners, evaluations }
    }

    case 'REORDER_PARTNERS': {
      const evaluations = {}
      action.partners.forEach((p, i) => {
        const oldIdx = state.partners.findIndex(op => op.id === p.id)
        evaluations[i] = state.evaluations[oldIdx] || structuredClone(DEFAULT_EVAL)
      })
      return { ...state, partners: action.partners, evaluations }
    }

    case 'UPDATE_PARTNER_NAME': {
      const partners = state.partners.map(p =>
        p.id === action.id ? { ...p, name: action.name } : p
      )
      return { ...state, partners }
    }

    case 'UPDATE_EVALUATION': {
      const current = state.evaluations[action.partnerIndex] || structuredClone(DEFAULT_EVAL)
      return {
        ...state,
        evaluations: {
          ...state.evaluations,
          [action.partnerIndex]: {
            ...current,
            [action.dimension]: { ...current[action.dimension], [action.field]: action.value },
          },
        },
      }
    }

    case 'SET_QUALIFICATION_DATA':
      return { ...state, qualificationData: action.data }

    case 'SET_RESULTS':
      return { ...state, results: action.results, sessionId: action.sessionId, currentStep: 'RESULTS' }

    case 'RESET':
      return makeInitialState()

    case 'RESTORE':
      return action.state

    default:
      return state
  }
}

const EquityContext = createContext(null)

export function EquityProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (
          parsed.currentStep &&
          parsed.currentStep !== 'RESULTS' &&
          Array.isArray(parsed.partners) &&
          parsed.partners.length >= 2
        ) return parsed
      }
    } catch {
      localStorage.removeItem(LS_KEY)
    }
    return makeInitialState()
  })

  useEffect(() => {
    if (state.currentStep !== 'RESULTS') {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    }
  }, [state])

  const goToStep = useCallback(step => dispatch({ type: 'SET_STEP', step }), [])
  const updateBriefing = useCallback((field, value) => dispatch({ type: 'UPDATE_BRIEFING', field, value }), [])
  const setSuggestedWeights = useCallback(weights => dispatch({ type: 'SET_SUGGESTED_WEIGHTS', weights }), [])
  const setDimensionWeights = useCallback(weights => dispatch({ type: 'SET_DIMENSION_WEIGHTS', weights }), [])
  const setPartnerCount = useCallback(count => dispatch({ type: 'SET_PARTNER_COUNT', count }), [])
  const addPartner = useCallback(() => dispatch({ type: 'ADD_PARTNER' }), [])
  const removePartner = useCallback(id => dispatch({ type: 'REMOVE_PARTNER', id }), [])
  const reorderPartners = useCallback(partners => dispatch({ type: 'REORDER_PARTNERS', partners }), [])
  const updatePartnerName = useCallback((id, name) => dispatch({ type: 'UPDATE_PARTNER_NAME', id, name }), [])
  const updateEvaluation = useCallback((partnerIndex, dimension, field, value) =>
    dispatch({ type: 'UPDATE_EVALUATION', partnerIndex, dimension, field, value }), [])
  const setQualificationData = useCallback(data => dispatch({ type: 'SET_QUALIFICATION_DATA', data }), [])
  const setResults = useCallback((results, sessionId) => dispatch({ type: 'SET_RESULTS', results, sessionId }), [])
  const resetAll = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <EquityContext.Provider value={{
      ...state,
      goToStep,
      updateBriefing,
      setSuggestedWeights,
      setDimensionWeights,
      setPartnerCount,
      addPartner,
      removePartner,
      reorderPartners,
      updatePartnerName,
      updateEvaluation,
      setQualificationData,
      setResults,
      resetAll,
      DEFAULT_EVAL,
    }}>
      {children}
    </EquityContext.Provider>
  )
}

export function useEquity() {
  const ctx = useContext(EquityContext)
  if (!ctx) throw new Error('useEquity deve ser usado dentro de EquityProvider')
  return ctx
}

export { DEFAULT_WEIGHTS, PARTNER_COLORS, DEFAULT_EVAL }
