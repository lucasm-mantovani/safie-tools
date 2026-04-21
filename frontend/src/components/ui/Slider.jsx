export default function Slider({
  label,
  name,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  formatValue,
  className = '',
}) {
  const displayValue = formatValue ? formatValue(value) : value

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="font-body text-sm font-medium text-gray-700">
            {label}
          </label>
          <span className="font-cta text-sm font-semibold text-primary">{displayValue}</span>
        </div>
      )}
      <input
        id={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between">
        <span className="font-body text-xs text-gray-400">{formatValue ? formatValue(min) : min}</span>
        <span className="font-body text-xs text-gray-400">{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  )
}
