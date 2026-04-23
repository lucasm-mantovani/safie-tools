import { Component } from 'react'

const LS_KEY = 'safie_equity_draft'

export default class EquityErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
    this.handleRetry = this.handleRetry.bind(this)
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleRetry() {
    window.location.reload()
  }

  handleReset() {
    localStorage.removeItem(LS_KEY)
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-safie-light flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-bg-dark mb-2">Algo deu errado</h2>
            <p className="font-body text-sm text-gray-500 mb-6">
              Ocorreu um erro inesperado. Seus dados podem ter sido perdidos.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark px-5 py-3 rounded-xl transition-colors"
              >
                Tentar novamente
              </button>
              <button
                onClick={this.handleReset}
                className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2"
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
