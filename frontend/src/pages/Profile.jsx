import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import AvatarUpload from '../components/profile/AvatarUpload'
import SessionsList from '../components/profile/SessionsList'
import PasswordStrengthIndicator from '../components/profile/PasswordStrengthIndicator'
import DeleteAccountModal from '../components/profile/DeleteAccountModal'

const TABS = [
  { id: 'account', label: 'Minha Conta' },
  { id: 'security', label: 'Segurança' },
  { id: 'notifications', label: 'Notificações' },
  { id: 'privacy', label: 'Dados e Privacidade' },
]

const SEGMENTS = [
  { value: 'tech', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'educacao', label: 'Educação' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'outros', label: 'Outros' },
]

function TabAccount({ profile, onSave }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
    business_segment: profile?.business_segment || '',
    bio: profile?.bio || '',
    linkedin_url: profile?.linkedin_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.put('/profile', form)
      setSuccess(true)
      onSave?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      <AvatarUpload currentUrl={profile?.avatar_url} onUpload={onSave} />

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
          <input value={form.full_name} onChange={handleChange('full_name')} className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input value={profile?.email || ''} disabled className="w-full border border-gray-200 bg-gray-50 rounded-[16px] px-3 py-2 text-sm text-gray-400" />
          <p className="text-xs text-gray-400 mt-1">Para alterar o e-mail, acesse a aba Segurança.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input value={form.phone} onChange={handleChange('phone')} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <input value={form.company_name} onChange={handleChange('company_name')} className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
          <select value={form.business_segment} onChange={handleChange('business_segment')} className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Selecione</option>
            {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio <span className="text-gray-400">({form.bio.length}/500)</span></label>
          <textarea value={form.bio} onChange={handleChange('bio')} maxLength={500} rows={3} className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input value={form.linkedin_url} onChange={handleChange('linkedin_url')} placeholder="https://linkedin.com/in/..." className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Perfil salvo com sucesso!</p>}

      <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-[16px] text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}

function TabSecurity({ profile }) {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  async function handleChangePassword(e) {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      setError('Nova senha e confirmação não coincidem.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { data } = await api.post('/profile/change-password', { current_password: passwords.current, new_password: passwords.new })
      setSuccess(data.message)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handlePwChange(field) {
    return (e) => setPasswords((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="font-heading text-base text-gray-900 mb-4">Alterar senha</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {['current', 'new', 'confirm'].map((field, i) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {['Senha atual', 'Nova senha', 'Confirmar nova senha'][i]}
              </label>
              <input type="password" value={passwords[field]} onChange={handlePwChange(field)} className="w-full border border-gray-300 rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {field === 'new' && <PasswordStrengthIndicator password={passwords.new} />}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-[16px] text-sm font-medium disabled:opacity-50">
            {saving ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-heading text-base text-gray-900 mb-2">Sessões ativas</h3>
        {profile?.last_login_at && (
          <p className="text-xs text-gray-400 mb-3">
            Último login: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(profile.last_login_at))}
          </p>
        )}
        <SessionsList />
      </div>
    </div>
  )
}

function TabNotifications({ profile }) {
  const [prefs, setPrefs] = useState(profile?.notification_preferences || {})
  const [saving, setSaving] = useState(null)

  async function handleToggle(key) {
    const newValue = !prefs[key]
    setPrefs((prev) => ({ ...prev, [key]: newValue }))
    setSaving(key)
    try {
      await api.put('/profile/notifications', { [key]: newValue })
    } catch {
      setPrefs((prev) => ({ ...prev, [key]: !newValue }))
    } finally {
      setSaving(null)
    }
  }

  const items = [
    { key: 'email_product_updates', label: 'Novidades da plataforma', desc: 'Novas ferramentas e funcionalidades' },
    { key: 'email_tool_results', label: 'Resultados das ferramentas', desc: 'Resumo dos diagnósticos realizados' },
    { key: 'email_commercial', label: 'Comunicações comerciais', desc: 'Ofertas e promoções da SAFIE' },
  ]

  return (
    <div className="max-w-lg space-y-4">
      {items.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
          <div>
            <p className="text-sm font-medium text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
          <button
            onClick={() => handleToggle(key)}
            disabled={saving === key}
            className={`relative w-10 h-6 rounded-full transition-colors ${prefs[key] ? 'bg-primary' : 'bg-gray-300'} disabled:opacity-60`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs[key] ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      ))}
    </div>
  )
}

function TabPrivacy() {
  const [showDelete, setShowDelete] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const { data } = await api.get('/profile/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'safie-dados.json'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="p-4 bg-gray-50 rounded-[16px]">
        <h3 className="text-sm font-medium text-gray-800 mb-1">Exportar meus dados</h3>
        <p className="text-xs text-gray-500 mb-3">Baixe um arquivo JSON com todos os seus dados e histórico de ferramentas.</p>
        <button onClick={handleExport} disabled={exporting} className="px-4 py-2 border border-gray-300 rounded-[16px] text-sm text-gray-700 hover:bg-white transition-colors disabled:opacity-50">
          {exporting ? 'Gerando...' : 'Exportar dados'}
        </button>
      </div>

      <div className="p-4 bg-red-50 rounded-[16px] border border-red-100">
        <h3 className="text-sm font-medium text-red-800 mb-1">Excluir conta</h3>
        <p className="text-xs text-red-600 mb-3">Ação irreversível. Seus dados pessoais serão anonimizados e removidos em 30 dias.</p>
        <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-600 text-white rounded-[16px] text-sm hover:bg-red-700 transition-colors">
          Excluir minha conta
        </button>
      </div>

      {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} />}
    </div>
  )
}

export default function Profile() {
  const { profile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('account')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-2xl text-gray-900 mb-8">Meu Perfil</h1>

      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'account' && <TabAccount profile={profile} onSave={refreshProfile} />}
      {activeTab === 'security' && <TabSecurity profile={profile} />}
      {activeTab === 'notifications' && <TabNotifications profile={profile} />}
      {activeTab === 'privacy' && <TabPrivacy />}
    </div>
  )
}
