import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function getCroppedImg(imageSrc, croppedAreaPixels) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height)
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85)
    }
  })
}

export default function AvatarUpload({ currentUrl, onUpload }) {
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const { refreshProfile } = useAuth()

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_MB = 5

  function handleFile(file) {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setError('Apenas JPEG, PNG ou WebP são aceitos.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Arquivo deve ter no máximo ${MAX_MB}MB.`)
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const onCropComplete = useCallback((_, area) => setCroppedArea(area), [])

  async function handleSave() {
    if (!croppedArea || !imageSrc) return
    setLoading(true)
    setError(null)
    try {
      const blob = await getCroppedImg(imageSrc, croppedArea)
      const formData = new FormData()
      formData.append('avatar', blob, 'avatar.webp')
      const { data } = await api.post('/profile/avatar', formData)
      onUpload?.(data.avatar_url)
      await refreshProfile?.()
      setImageSrc(null)
    } catch (err) {
      setError(err.message || 'Falha ao enviar avatar.')
    } finally {
      setLoading(false)
    }
  }

  if (imageSrc) {
    return (
      <div className="space-y-4">
        <div className="relative h-64 rounded-[16px] overflow-hidden bg-gray-900">
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
        </div>
        <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => setImageSrc(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-[16px] text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 px-4 py-2 bg-primary text-white rounded-[16px] text-sm disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar foto'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-[16px] cursor-pointer hover:border-primary transition-colors"
    >
      {currentUrl ? (
        <img src={currentUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
      <p className="text-sm text-gray-500 text-center">Arraste uma imagem ou clique para selecionar</p>
      <p className="text-xs text-gray-400">JPEG, PNG ou WebP — máx. 5MB</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  )
}
