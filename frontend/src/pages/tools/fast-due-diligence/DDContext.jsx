import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const LS_KEY = 'safie_dd_draft'

const CATEGORY_ORDER_CAPTACAO = ['corporate', 'legal', 'financial', 'product', 'hr', 'commercial', 'captacao_specific']
const CATEGORY_ORDER_MA = ['corporate', 'legal', 'financial', 'product', 'hr', 'commercial', 'ma_specific']

export function getCategoryOrder(operationType) {
  return operationType === 'captacao' ? CATEGORY_ORDER_CAPTACAO : CATEGORY_ORDER_MA
}

function makeInitialState() {
  return {
    currentStep: 'INTRO',
    operationType: null,
    companySnapshot: {
      company_name: '',
      founding_year: '',
      business_segment: '',
      current_stage: null,
      monthly_revenue_range: null,
      employees_count_range: null,
      has_previous_funding: null,
      has_legal_advisor: null,
    },
    checklistResponses: {},
    checklistCategoryIndex: 0,
    checklistSubStep: 'items',
    qualificationData: {},
    results: null,
    sessionId: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'SET_OPERATION_TYPE':
      return { ...state, operationType: action.value, currentStep: 'COMPANY_SNAPSHOT' }

    case 'UPDATE_SNAPSHOT':
      return { ...state, companySnapshot: { ...state.companySnapshot, [action.field]: action.value } }

    case 'SET_ITEM_RESPONSE': {
      const key = action.id
      const prev = state.checklistResponses[key] || {}
      return {
        ...state,
        checklistResponses: {
          ...state.checklistResponses,
          [key]: { ...prev, status: action.status },
        },
      }
    }

    case 'SET_ITEM_DESCRIPTION': {
      const key = action.id
      const prev = state.checklistResponses[key] || {}
      return {
        ...state,
        checklistResponses: {
          ...state.checklistResponses,
          [key]: { ...prev, founder_description: action.value },
        },
      }
    }

    case 'SET_CHECKLIST_CATEGORY_INDEX':
      return { ...state, checklistCategoryIndex: action.index, checklistSubStep: 'items' }

    case 'SET_CHECKLIST_SUBSTEP':
      return { ...state, checklistSubStep: action.subStep }

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

const DDContext = createContext(null)

export function DDProvider({ children, initialCompanyName, initialSegment }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!parsed.currentStep) { localStorage.removeItem(LS_KEY); return makeInitialState() }
        if (parsed.currentStep === 'RESULTS') return makeInitialState()
        if (parsed.currentStep === 'QUALIFICATION_MODAL' && !parsed.results) {
          return { ...parsed, currentStep: 'CHECKLIST', checklistSubStep: 'summary' }
        }
        return parsed
      }
    } catch {
      localStorage.removeItem(LS_KEY)
    }
    const fresh = makeInitialState()
    fresh.companySnapshot.company_name = initialCompanyName || ''
    fresh.companySnapshot.business_segment = initialSegment || ''
    return fresh
  })

  useEffect(() => {
    if (state.currentStep !== 'RESULTS') {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    }
  }, [state])

  const goToStep = useCallback(step => dispatch({ type: 'SET_STEP', step }), [])
  const setOperationType = useCallback(value => dispatch({ type: 'SET_OPERATION_TYPE', value }), [])
  const updateSnapshot = useCallback((field, value) => dispatch({ type: 'UPDATE_SNAPSHOT', field, value }), [])
  const setItemResponse = useCallback((id, status) => dispatch({ type: 'SET_ITEM_RESPONSE', id, status }), [])
  const setItemDescription = useCallback((id, value) => dispatch({ type: 'SET_ITEM_DESCRIPTION', id, value }), [])
  const setCategoryIndex = useCallback(index => dispatch({ type: 'SET_CHECKLIST_CATEGORY_INDEX', index }), [])
  const setChecklistSubStep = useCallback(subStep => dispatch({ type: 'SET_CHECKLIST_SUBSTEP', subStep }), [])
  const setQualificationData = useCallback(data => dispatch({ type: 'SET_QUALIFICATION_DATA', data }), [])
  const setResults = useCallback((results, sessionId) => dispatch({ type: 'SET_RESULTS', results, sessionId }), [])
  const resetAll = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <DDContext.Provider value={{
      ...state,
      goToStep,
      setOperationType,
      updateSnapshot,
      setItemResponse,
      setItemDescription,
      setCategoryIndex,
      setChecklistSubStep,
      setQualificationData,
      setResults,
      resetAll,
      getCategoryOrder,
    }}>
      {children}
    </DDContext.Provider>
  )
}

export function useDD() {
  const ctx = useContext(DDContext)
  if (!ctx) throw new Error('useDD deve ser usado dentro de DDProvider')
  return ctx
}
