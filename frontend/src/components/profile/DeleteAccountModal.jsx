import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function DeleteAccountModal({ onClose }) {
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { signOut } = useAuth()

  async function handleDelete() {
    if (confirmation !== 'EXCLUIR') return
    setLoading(true)
    setError(null)
    try {
      await api.delete('/profile', { data: { confirmation } })
      await signOut()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Falha ao excluir conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-xl">
        <h2 className="font-heading text-xl text-gray-900 mb-2">Excluir conta</h2>
        <p className="text-sm text-gray-600 mb-4">
          Esta ação é permanente. Seus dados pessoais serão anonimizados e removidos completamente em 30 dias.
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-6 space-y-1">
          <li>Acesso à plataforma será bloqueado imediatamente</li>
          <li>Histórico de ferramentas será retido por 30 dias</li>
          <li>Esta ação não pode ser desfeita</li>
        </ul>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Digite <strong>EXCLUIR</strong> para confirmar
        </label>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="EXCLUIR"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-[16px] text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmation !== 'EXCLUIR' || loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[16px] text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Excluindo...' : 'Excluir minha conta'}
          </button>
        </div>
      </div>
    </div>
  )
}
