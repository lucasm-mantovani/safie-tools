import { useMemo } from 'react'
import zxcvbn from 'zxcvbn'

const LEVELS = [
  { label: 'Muito fraca', color: 'bg-red-500' },
  { label: 'Fraca', color: 'bg-orange-400' },
  { label: 'Razoável', color: 'bg-yellow-400' },
  { label: 'Forte', color: 'bg-green-400' },
  { label: 'Muito forte', color: 'bg-green-600' },
]

export default function PasswordStrengthIndicator({ password }) {
  const result = useMemo(() => (password ? zxcvbn(password) : null), [password])

  if (!password) return null

  const score = result?.score ?? 0
  const level = LEVELS[score]

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? level.color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{level.label}</p>
    </div>
  )
}
