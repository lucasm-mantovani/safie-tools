// Variantes: default | elevated | bordered
export default function Card({ children, variant = 'default', className = '', onClick }) {
  const variants = {
    default: 'bg-white rounded-2xl p-6',
    elevated: 'bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300',
    bordered: 'bg-white rounded-2xl p-6 border border-gray-100',
  }

  return (
    <div
      className={`${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
