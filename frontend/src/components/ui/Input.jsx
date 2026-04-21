// Componente de input com suporte a label, erro e registro no React Hook Form
// Aceita `validation` para regras do react-hook-form, e `required` como atalho visual + de validação
export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  required = false,
  validation = {},
  className = '',
  ...props
}) {
  // Mescla `required` automático com regras extras passadas via `validation`
  const rules = {
    ...(required && { required: 'Campo obrigatório' }),
    ...validation,
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="font-body text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...(register ? register(name, rules) : {})}
        {...props}
        className={`
          w-full px-4 py-3 rounded-lg border font-body text-sm
          bg-white text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}
        `}
      />
      {error && (
        <p className="font-body text-xs text-red-500 mt-1">{error.message || error}</p>
      )}
    </div>
  )
}
