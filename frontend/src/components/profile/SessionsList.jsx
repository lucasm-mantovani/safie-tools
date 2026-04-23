import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function deviceIcon(userAgentHash) {
  // Sem user agent detalhado — mostra ícone genérico
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
}

export default function SessionsList() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState(null)

  async function load() {
    try {
      const { data } = await api.get('/auth/sessions')
      setSessions(data.sessions || [])
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  async function revoke(id) {
    setRevoking(id)
    try {
      await api.delete(`/auth/sessions/${id}`)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } finally {
      setRevoking(null)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p className="text-sm text-gray-500">Carregando sessões...</p>
  if (sessions.length === 0) return <p className="text-sm text-gray-500">Nenhuma sessão ativa além desta.</p>

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-[16px] border border-gray-100">
          <div className="flex items-center gap-3">
            {deviceIcon(session.user_agent_hash)}
            <div>
              <p className="text-sm font-medium text-gray-800">{session.ip_address || 'IP desconhecido'}</p>
              <p className="text-xs text-gray-500">Ativo em {formatDate(session.last_active)}</p>
            </div>
          </div>
          <button
            onClick={() => revoke(session.id)}
            disabled={revoking === session.id}
            className="text-xs text-red-600 hover:underline disabled:opacity-50"
          >
            {revoking === session.id ? 'Encerrando...' : 'Encerrar'}
          </button>
        </div>
      ))}
    </div>
  )
}
